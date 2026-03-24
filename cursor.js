/* ===============================================
   THE DARK WOOD — Custom Cursor
   =============================================== */

(function() {
    'use strict';

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice || window.innerWidth < 769) return;

    const cursor = document.querySelector('.custom-cursor');
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    const label = cursor.querySelector('.cursor-label');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let dotX = 0, dotY = 0;
    const ringSpeed = 0.15;
    const dotSpeed = 0.6;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        // Smooth follow
        dotX += (mouseX - dotX) * dotSpeed;
        dotY += (mouseY - dotY) * dotSpeed;
        ringX += (mouseX - ringX) * ringSpeed;
        ringY += (mouseY - ringY) * ringSpeed;

        dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
        ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
        label.style.transform = `translate(${ringX}px, ${ringY}px)`;

        requestAnimationFrame(animate);
    }
    animate();

    // Hoverable elements
    const hoverables = 'a, button, .service-card, .whyus-card, .nav-link, .hero__cta, input';
    const portfolioItems = '.portfolio__item';

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest(hoverables);
        const portfolioTarget = e.target.closest(portfolioItems);

        if (portfolioTarget) {
            cursor.classList.add('is-hovering', 'has-label');
            label.textContent = 'View';
        } else if (target) {
            cursor.classList.add('is-hovering');
            cursor.classList.remove('has-label');
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest(hoverables);
        const portfolioTarget = e.target.closest(portfolioItems);

        if (target || portfolioTarget) {
            cursor.classList.remove('is-hovering', 'has-label');
            label.textContent = '';
        }
    });

    // Magnetic effect for buttons
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
})();
