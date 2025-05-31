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
async function loadComponent(elementId, componentPath) {
    try {
        // Show loading state
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id '${elementId}' not found`);
        }
        
        element.innerHTML = `
            <div class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading ${elementId}...</span>
                </div>
            </div>`;
        
        // Resolve the correct path based on current environment
        const resolvedPath = resolveComponentPath(componentPath);
        
        if (DEBUG) {
            console.log(`Fetching component: ${elementId}`, {
                originalPath: componentPath,
                resolvedPath: resolvedPath,
                fullURL: window.location.origin + resolvedPath
            });
        }
        
        const response = await fetch(resolvedPath);
        
        if (!response.ok) {
            throw new Error(`Failed to load ${resolvedPath}: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        element.innerHTML = html;
        
        // Initialize Bootstrap components after header is loaded
        if (elementId === 'header') {
            initializeBootstrapComponents();
        }

        // Fix paths in the loaded component
        fixComponentPaths(element);
        
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        // Show a minimal fallback for critical navigation
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const baseUrl = getBaseUrl();
        
        if (elementId === 'header') {
            element.innerHTML = `
                <nav class="navbar navbar-expand-lg navbar-light bg-light">
                    <div class="container">
                        <a class="navbar-brand" href="${baseUrl}index.html">Sungabha</a>
                        <div class="d-flex">
                            <a class="btn btn-primary me-2" href="${baseUrl}index.html">Home</a>
                            <a class="btn btn-outline-primary" href="${baseUrl}contact.html">Contact</a>
                        </div>
                    </div>
                </nav>`;
        } else if (elementId === 'footer') {
            element.innerHTML = `
                <footer class="py-3 bg-light">
                    <div class="container text-center">
                        <p class="mb-0">© 2025 Sungabha Awasiya Ma Vi</p>
                        <a href="${baseUrl}index.html" class="text-decoration-none">Back to Home</a>
                    </div>
                </footer>`;
        }
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

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
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
    loadComponent('header', 'components/header.html');
    loadComponent('footer', 'components/footer.html');

    // Initialize other features
    initializeScrollAnimations();
    initializeCounters();
});

// Add to main.js
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
  // You could also send this to an error tracking service
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