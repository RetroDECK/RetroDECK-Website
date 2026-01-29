function pixelFontToggle() {
    const pixelFontSwitchElem = document.getElementById('pixel-font-switch');
    if (pixelFontSwitchElem.checked) {
        document.documentElement.classList.remove('accessible-mode');
        localStorage.setItem('accessibleMode', 'false');
        // Resume carousels
        document.querySelectorAll('.carousel').forEach(el => {
            const carousel = bootstrap.Carousel.getOrCreateInstance(el);
            carousel.cycle();
        });
    } else {
        document.documentElement.classList.add('accessible-mode');
        localStorage.setItem('accessibleMode', 'true');
        // Pause carousels
        document.querySelectorAll('.carousel').forEach(el => {
            const carousel = bootstrap.Carousel.getOrCreateInstance(el);
            carousel.pause();
        });
    }
}

// Load saved preference on page load
document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('accessibleMode');
    const pixelFontSwitchElem = document.getElementById('pixel-font-switch');
    
    // Also respect system preference if no saved preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (saved === 'true' || (saved === null && prefersReducedMotion)) {
        pixelFontSwitchElem.checked = false;
        document.documentElement.classList.add('accessible-mode');
        // Pause carousels after Bootstrap initializes them
        setTimeout(() => {
            document.querySelectorAll('.carousel').forEach(el => {
                const carousel = bootstrap.Carousel.getOrCreateInstance(el);
                carousel.pause();
            });
        }, 100);
    }
});