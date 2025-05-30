// Function to load HTML components
async function loadComponent(elementId, componentPath) {
    try {
        // Convert absolute path to relative path
        const relativePath = componentPath.startsWith('/') ? componentPath.slice(1) : componentPath;
        const response = await fetch(relativePath);
        
        if (!response.ok) {
            throw new Error(`Failed to load ${relativePath}: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        const element = document.getElementById(elementId);
        
        if (!element) {
            throw new Error(`Element with id '${elementId}' not found`);
        }
        
        element.innerHTML = html;
        
        // Initialize Bootstrap components after header is loaded
        if (elementId === 'header') {
            initializeBootstrapComponents();
        }
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        // Show a minimal fallback for critical navigation
        if (elementId === 'header') {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = `
                    <nav class="navbar navbar-expand-lg navbar-light bg-light">
                        <div class="container">
                            <a class="navbar-brand" href="index.html">Sungabha</a>
                            <a class="btn btn-primary" href="index.html">Home</a>
                        </div>
                    </nav>`;
            }
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
    // Load header and footer components
    loadComponent('header', 'components/header.html');
    loadComponent('footer', 'components/footer.html');

    // Initialize other features
    initializeScrollAnimations();
    initializeCounters();
}); 