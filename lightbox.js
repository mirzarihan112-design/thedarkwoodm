/* ===============================================
   THE DARK WOOD — Lightbox
   =============================================== */

(function() {
    'use strict';

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxBackdrop = lightbox.querySelector('.lightbox__backdrop');

    let currentImages = [];
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    function openLightbox(images, index) {
        currentImages = images;
        currentIndex = index;
        showImage(currentIndex);
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImage.src = '';
        }, 400);
    }

    function showImage(index) {
        if (index < 0 || index >= currentImages.length) return;
        currentIndex = index;
        lightboxImage.style.opacity = '0';
        lightboxImage.style.transform = 'scale(0.95)';
        setTimeout(() => {
            lightboxImage.src = currentImages[currentIndex];
            lightboxImage.alt = `Portfolio image ${currentIndex + 1}`;
            lightboxImage.style.opacity = '1';
            lightboxImage.style.transform = 'scale(1)';
        }, 150);

        // Update nav visibility
        lightboxPrev.style.opacity = currentIndex > 0 ? '1' : '0.3';
        lightboxNext.style.opacity = currentIndex < currentImages.length - 1 ? '1' : '0.3';
    }

    function nextImage() {
        if (currentIndex < currentImages.length - 1) {
            showImage(currentIndex + 1);
        }
    }

    function prevImage() {
        if (currentIndex > 0) {
            showImage(currentIndex - 1);
        }
    }

    // Event listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBackdrop.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', nextImage);
    lightboxPrev.addEventListener('click', prevImage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });

    // Touch swipe support
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextImage();
            else prevImage();
        }
    }, { passive: true });

    // Expose globally
    window.DWLightbox = {
        open: openLightbox,
        close: closeLightbox
    };
})();
