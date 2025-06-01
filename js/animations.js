/**
 * Sungabha School Website Animations
 * Custom animations using GSAP and other libraries
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  
  // Animated cursor with trail effect
  createAnimatedCursor();
  
  // Page transition animations
  setupPageTransitions();
  
  // Smooth scroll for anchor links
  setupSmoothScroll();
  
  // Animate elements on hover
  setupHoverAnimations();
  
  // Timeline animations for history section if present
  if (document.querySelector('#history')) {
    animateTimeline();
  }
});

/**
 * Creates an animated cursor with trailing effect
 */
function createAnimatedCursor() {
  // Create cursor elements
  const cursorOuter = document.createElement('div');
  const cursorInner = document.createElement('div');
  
  cursorOuter.className = 'cursor-outer';
  cursorInner.className = 'cursor-inner';
  
  document.body.appendChild(cursorOuter);
  document.body.appendChild(cursorInner);
  
  // Add styles to head
  const style = document.createElement('style');
  style.innerHTML = `
    .cursor-inner {
      position: fixed;
      left: 0;
      top: 0;
      width: 8px;
      height: 8px;
      background-color: #0d6efd;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      opacity: 1;
      transition: opacity 0.3s ease-in-out;
    }
    
    .cursor-outer {
      position: fixed;
      left: 0;
      top: 0;
      width: 40px;
      height: 40px;
      border: 2px solid rgba(13, 110, 253, 0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      opacity: 0.5;
      transition: transform 0.1s ease-out;
    }
    
    .cursor-hover {
      transform: scale(1.5);
      background-color: rgba(13, 110, 253, 0.1);
    }
    
    @media (max-width: 768px) {
      .cursor-inner, .cursor-outer {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Track mouse movement
  let mouseX = 0;
  let mouseY = 0;
  let innerX = 0;
  let innerY = 0;
  let outerX = 0;
  let outerY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Add hover effect to interactive elements
  const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, .card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorOuter.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursorOuter.classList.remove('cursor-hover');
    });
  });
  
  // Hide cursor when mouse leaves window
  document.addEventListener('mouseout', (e) => {
    if (e.relatedTarget === null) {
      cursorInner.style.opacity = '0';
      cursorOuter.style.opacity = '0';
    }
  });
  
  document.addEventListener('mouseover', () => {
    cursorInner.style.opacity = '1';
    cursorOuter.style.opacity = '0.5';
  });
  
  // Animation loop
  function animateCursor() {
    // Calculate smooth movement with easing
    innerX += (mouseX - innerX) * 0.2;
    innerY += (mouseY - innerY) * 0.2;
    
    outerX += (mouseX - outerX) * 0.1;
    outerY += (mouseY - outerY) * 0.1;
    
    // Apply positions
    cursorInner.style.transform = `translate(${innerX}px, ${innerY}px)`;
    cursorOuter.style.transform = `translate(${outerX - 16}px, ${outerY - 16}px)`;
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
}

/**
 * Sets up smooth scrolling for anchor links
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * Sets up page transition animations
 */
function setupPageTransitions() {
  // Add page transition overlay
  const overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  document.body.appendChild(overlay);
  
  // Add styles
  const style = document.createElement('style');
  style.innerHTML = `
    .page-transition-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #0d6efd;
      z-index: 9999;
      transform: translateY(100%);
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
  
  // Animate page entrance
  gsap.to('.page-transition-overlay', {
    y: '-100%',
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.set('.page-transition-overlay', { y: '100%' });
    }
  });
  
  // Handle link clicks for page transitions
  document.querySelectorAll('a').forEach(link => {
    // Skip anchor links and external links
    if (link.getAttribute('href') && 
        !link.getAttribute('href').startsWith('#') && 
        !link.getAttribute('href').startsWith('http') &&
        !link.getAttribute('href').startsWith('mailto:') &&
        !link.getAttribute('href').startsWith('tel:')) {
      
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href) {
          e.preventDefault();
          
          gsap.to('.page-transition-overlay', {
            y: '0%',
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => {
              window.location.href = href;
            }
          });
        }
      });
    }
  });
}

/**
 * Sets up hover animations for interactive elements
 */
function setupHoverAnimations() {
  // Card hover effects
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      gsap.to(this, {
        y: -10,
        boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
        duration: 0.3
      });
    });
    
    card.addEventListener('mouseleave', function() {
      gsap.to(this, {
        y: 0,
        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
        duration: 0.3
      });
    });
  });
  
  // Button hover effects
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      gsap.to(this, {
        scale: 1.05,
        duration: 0.2
      });
    });
    
    btn.addEventListener('mouseleave', function() {
      gsap.to(this, {
        scale: 1,
        duration: 0.2
      });
    });
  });
}

/**
 * Animates timeline elements in the history section
 */
function animateTimeline() {
  const timelineItems = document.querySelectorAll('#history .timeline .timeline-item');
  
  timelineItems.forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      delay: index * 0.2
    });
  });
} 