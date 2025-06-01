/**
 * Sungabha School Website Main JavaScript
 * Handles common functionality across the site
 */

// Debug flag - set to true to see detailed path resolution logs
const DEBUG = true;

// Function to get the base URL for the current environment
function getBaseUrl() {
    // Check if we're on GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    let baseUrl = '/';
    
    if (isGitHubPages) {
        // Get full pathname and split it
        const fullPath = window.location.pathname;
        const pathSegments = fullPath.split('/').filter(segment => segment.length > 0);
        
        // The repository name should be the first segment on GitHub Pages
        if (pathSegments.length > 0) {
            baseUrl = `/${pathSegments[0]}/`;
        }
    }
    
    if (DEBUG) {
        console.log('Environment:', isGitHubPages ? 'GitHub Pages' : 'Local');
        console.log('Base URL:', baseUrl);
        console.log('Current pathname:', window.location.pathname);
        console.log('Hostname:', window.location.hostname);
    }
    
    return baseUrl;
}

// Function to resolve paths relative to the current page
function resolveComponentPath(componentPath) {
    const baseUrl = getBaseUrl();
    
    // Remove any leading slash from the component path
    const cleanComponentPath = componentPath.startsWith('/') ? componentPath.substring(1) : componentPath;
    
    // Combine the base URL with the component path
    const resolvedPath = baseUrl + cleanComponentPath;
    
    if (DEBUG) {
        console.log('Resolving component path:', {
            input: componentPath,
            baseUrl: baseUrl,
            cleanPath: cleanComponentPath,
            resolvedPath: resolvedPath
        });
    }
    
    return resolvedPath;
}

// Function to fix image and link paths in a component
function fixComponentPaths(element) {
    const baseUrl = getBaseUrl();
    
    element.querySelectorAll('a[href], img[src]').forEach(el => {
        const originalHref = el.getAttribute('href');
        const originalSrc = el.getAttribute('src');
        
        if (el.hasAttribute('href') && !originalHref.startsWith('http') && 
            !originalHref.startsWith('mailto:') && !originalHref.startsWith('tel:')) {
            const href = originalHref;
            if (!href.startsWith('/') && !href.startsWith('../')) {
                el.href = baseUrl + href;
                if (DEBUG) console.log('Fixed href:', originalHref, '->', el.href);
            }
        }
        if (el.hasAttribute('src') && !originalSrc.startsWith('http')) {
            const src = originalSrc;
            if (!src.startsWith('/') && !src.startsWith('../')) {
                el.src = baseUrl + src;
                if (DEBUG) console.log('Fixed src:', originalSrc, '->', el.src);
            }
        }
    });
}

// Function to load HTML components with improved error handling
async function loadComponent(componentName, selector) {
    const targetElement = document.querySelector(selector);
    
    if (!targetElement) {
        console.warn(`Target element for ${componentName} not found: ${selector}`);
        return;
    }
    
    try {
        // Show loading state
        targetElement.innerHTML = `
            <div class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading ${componentName}...</span>
                </div>
            </div>`;
        
        // Resolve the correct path based on current environment
        const resolvedPath = resolveComponentPath(`components/${componentName}.html`);
        
        if (DEBUG) {
            console.log(`Fetching component: ${componentName}`, {
                originalPath: `components/${componentName}.html`,
                resolvedPath: resolvedPath,
                fullURL: window.location.origin + resolvedPath
            });
        }
        
        // Use fetch with cache busting to prevent caching issues
        const cacheBuster = `?v=${new Date().getTime()}`;
        const response = await fetch(resolvedPath + cacheBuster, { 
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load ${componentName} component: ${response.status}`);
        }
        
        const html = await response.text();
        
        // Check if HTML content is valid
        if (!html || html.trim() === '') {
            throw new Error(`Empty content received for ${componentName} component`);
        }
        
        targetElement.innerHTML = html;
        
        // Fix paths in the loaded component
        fixComponentPaths(targetElement);
        
        // Dispatch event when component is loaded
        const event = new CustomEvent('componentLoaded', { 
            detail: { componentName: componentName } 
        });
        document.dispatchEvent(event);
        
        // Execute component-specific scripts if they exist
        const scripts = targetElement.querySelectorAll('script');
        scripts.forEach(script => {
            try {
                const newScript = document.createElement('script');
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                newScript.appendChild(document.createTextNode(script.innerHTML));
                script.parentNode.replaceChild(newScript, script);
            } catch (error) {
                console.error(`Error executing script in ${componentName} component:`, error);
            }
        });
        
        // Initialize specific components after loading
        if (componentName === 'header') {
            // Initialize Bootstrap components
            initializeBootstrapComponents();
            
            // Set active nav link
            setActiveNavLink();
            
            // Initialize navbar animations
            initializeNavbarAnimations();
        }
        
        if (componentName === 'footer') {
            // Initialize footer animations
            initializeFooterAnimations();
        }
        
        console.log(`${componentName} component loaded successfully`);
    } catch (error) {
        console.error(`Error loading ${componentName} component:`, error);
        
        // Show error message
        targetElement.innerHTML = `
            <div class="alert alert-danger">
                Failed to load ${componentName} component. 
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="loadComponent('${componentName}', '${selector}')">
                    Try Again
                </button>
            </div>`;
        
        // Retry loading after a delay
        setTimeout(() => {
            if (targetElement.querySelector('.alert')) {
                loadComponent(componentName, selector);
            }
        }, 3000);
    }
}

// Initialize Bootstrap components
function initializeBootstrapComponents() {
    // Initialize all dropdowns
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    dropdownElementList.forEach(dropdown => {
        new bootstrap.Dropdown(dropdown);
    });

    // Initialize all tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Scroll animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Statistics counter animation
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60 FPS
                let current = 0;

                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        entry.target.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        entry.target.textContent = target;
                    }
                };

                updateCounter();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Set active nav link based on current page
function setActiveNavLink() {
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    let activeSet = false;
    
    // Clear all active classes first
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // First check for exact matches
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath && currentLocation.endsWith(linkPath)) {
            link.classList.add('active');
            activeSet = true;
        }
    });
    
    // If no exact match, check for index.html or root path
    if (!activeSet && (currentLocation.endsWith('/') || currentLocation.endsWith('/index.html'))) {
        const homeLink = document.querySelector('.nav-link[href="index.html"]');
        if (homeLink) {
            homeLink.classList.add('active');
            activeSet = true;
        }
    }
    
    // If still no match, check for partial matches
    if (!activeSet) {
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath && linkPath !== 'index.html' && linkPath.length > 1) {
                if (currentLocation.includes(linkPath)) {
                    link.classList.add('active');
                }
            }
        });
    }
}

// Initialize navbar animations
function initializeNavbarAnimations() {
    // Add scrolled class to navbar when scrolling
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        function checkScroll() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        // Initial check in case page is loaded scrolled down
        checkScroll();
        window.addEventListener('scroll', checkScroll);
        
        // Add animation to navbar items on load with staggered timing
        const navItems = document.querySelectorAll('.navbar-nav > .nav-item');
        navItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animated');
            }, 100 * (index + 1));
        });
    }
}

// Initialize footer animations
function initializeFooterAnimations() {
    // Footer fade-in animation on scroll
    const footerFadeElements = document.querySelectorAll('.footer-fade');
    
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                footerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    footerFadeElements.forEach(element => {
        footerObserver.observe(element);
    });
    
    // Back to top button functionality
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        function toggleBackToTopButton() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        }
        
        // Initial check in case page is loaded scrolled down
        toggleBackToTopButton();
        window.addEventListener('scroll', toggleBackToTopButton);
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Log environment information
    if (DEBUG) {
        console.log('=== Environment Information ===');
        console.log('URL:', window.location.href);
        console.log('PathName:', window.location.pathname);
        console.log('Hostname:', window.location.hostname);
        console.log('Base URL:', getBaseUrl());
        console.log('==========================');
    }
    
    // Load header and footer components
    loadComponent('header', '#header');
    loadComponent('footer', '#footer');
    
    // Initialize animations
    initializeScrollAnimations();
    initializeCounters();
    
    // Add event listener for component loading completion
    document.addEventListener('componentLoaded', function(e) {
        console.log(`Component loaded: ${e.detail.componentName}`);
        
        // Check if all components are loaded
        if (document.querySelector('#header')?.innerHTML && document.querySelector('#footer')?.innerHTML) {
            console.log('All components loaded successfully');
        }
    });
    
    // Fallback check to ensure components are loaded
    setTimeout(() => {
        // Check header
        const headerElement = document.getElementById('header');
        if (headerElement && (!headerElement.innerHTML || headerElement.innerHTML.includes('Failed to load'))) {
            console.log('Header failed to load, trying again...');
            loadComponent('header', '#header');
        }
        
        // Check footer
        const footerElement = document.getElementById('footer');
        if (footerElement && (!footerElement.innerHTML || footerElement.innerHTML.includes('Failed to load'))) {
            console.log('Footer failed to load, trying again...');
            loadComponent('footer', '#footer');
        }
    }, 2000);
});

// Handle errors gracefully
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.message);
    // Prevent the error from breaking the entire site
    return true;
});

// Update service worker registration to use correct path
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = getBaseUrl() + 'sw.js';
        navigator.serviceWorker.register(swPath)
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.error('Service Worker error:', err));
    });
}

/**
 * Format date in Nepali format
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatNepaliDate(date) {
    // Implement Nepali date conversion logic if needed
    return date.toLocaleDateString('ne-NP');
}

/**
 * Detect mobile devices
 * @returns {boolean} True if the user is on a mobile device
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if an element is in viewport
 * @param {HTMLElement} el - Element to check
 * @returns {boolean} True if element is in viewport
 */
function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
} 