/* ===============================================
   THE DARK WOOD — GSAP Animations
   =============================================== */

(function() {
    'use strict';

    // Wait for GSAP & ScrollTrigger
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    window.DWAnimations = {

        init: function() {
            this.splitTextAnimations();
            this.revealAnimations();
            this.cardAnimations();
            this.heroAnimations();
            this.parallaxEffects();
            this.drawLineAnimations();
            this.clipRevealAnimations();
            this.counterAnimations();
        },

        // Split text animations for headings
        splitTextAnimations: function() {
            const headings = document.querySelectorAll('.anim-split-words');
            if (typeof SplitType === 'undefined') {
                // Fallback: just fade in
                headings.forEach(heading => {
                    gsap.from(heading, {
                        y: 40,
                        opacity: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: heading,
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    });
                });
                return;
            }

            headings.forEach(heading => {
                // Skip hero title — handled separately in heroAnimations
                if (heading.classList.contains('hero__title')) return;

                const split = new SplitType(heading, { types: 'words' });

                gsap.from(split.words, {
                    y: 60,
                    opacity: 0,
                    rotateX: -15,
                    duration: 0.9,
                    stagger: 0.04,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: heading,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        },

        // General reveal animations (fade up)
        revealAnimations: function() {
            const reveals = document.querySelectorAll('.anim-reveal');
            reveals.forEach((el, i) => {
                // Skip elements inside hero (handled separately)
                if (el.closest('.hero')) return;

                gsap.from(el, {
                    y: 40,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        },

        // Staggered card animations
        cardAnimations: function() {
            // Service cards
            const serviceCards = document.querySelectorAll('.service-card.anim-card');
            if (serviceCards.length) {
                gsap.from(serviceCards, {
                    y: 60,
                    opacity: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.services__grid',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                });
            }

            // Why Us cards
            const whyusCards = document.querySelectorAll('.whyus-card.anim-card');
            if (whyusCards.length) {
                gsap.from(whyusCards, {
                    y: 60,
                    opacity: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.whyus__grid',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                });
            }
        },

        // Hero section animations (called after preloader)
        heroAnimations: function() {
            const heroTitle = document.querySelector('.hero__title');
            const heroLabel = document.querySelector('.hero__label');
            const heroSubtitle = document.querySelector('.hero__subtitle');
            const heroCta = document.querySelector('.hero__cta');
            const scrollIndicator = document.querySelector('.hero__scroll-indicator');

            if (!heroTitle) return;

            const tl = gsap.timeline({ delay: 0.3 });

            // Label
            tl.from(heroLabel, {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            });

            // Title - word by word
            if (typeof SplitType !== 'undefined') {
                const split = new SplitType(heroTitle, { types: 'words' });
                tl.from(split.words, {
                    y: 80,
                    opacity: 0,
                    rotateX: -20,
                    duration: 0.9,
                    stagger: 0.06,
                    ease: 'power3.out'
                }, '-=0.3');
            } else {
                tl.from(heroTitle, {
                    y: 60,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out'
                }, '-=0.3');
            }

            // Subtitle
            tl.from(heroSubtitle, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.4');

            // CTA
            tl.from(heroCta, {
                y: 20,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out'
            }, '-=0.3');

            // Scroll indicator
            tl.from(scrollIndicator, {
                opacity: 0,
                duration: 1,
                ease: 'power2.out'
            }, '-=0.2');

            // Store the timeline so preloader can trigger it
            window.heroTimeline = tl;
            tl.pause();
        },

        // Parallax effects
        parallaxEffects: function() {
            // Hero image parallax
            const heroImg = document.querySelector('.hero__bg-wrapper');
            if (heroImg) {
                gsap.to(heroImg, {
                    y: 120,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            }
        },

        // Gold line draw-in
        drawLineAnimations: function() {
            const lines = document.querySelectorAll('.anim-draw-line');
            lines.forEach(line => {
                gsap.from(line, {
                    width: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: line,
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        },

        // Image clip-path reveal
        clipRevealAnimations: function() {
            const reveals = document.querySelectorAll('.anim-clip-reveal');
            reveals.forEach(wrapper => {
                const overlay = wrapper.querySelector('::before') || wrapper;
                gsap.to(wrapper, {
                    scrollTrigger: {
                        trigger: wrapper,
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                        onEnter: () => {
                            gsap.fromTo(wrapper, 
                                { clipPath: 'inset(0 100% 0 0)' },
                                { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power3.inOut' }
                            );
                        }
                    }
                });
            });
        },

        // Counter animation
        counterAnimations: function() {
            const counters = document.querySelectorAll('[data-counter]');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-counter'));
                gsap.to(counter, {
                    textContent: target,
                    duration: 2,
                    ease: 'power2.out',
                    snap: { textContent: 1 },
                    scrollTrigger: {
                        trigger: counter,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        },

        // Re-init scroll triggers (called after dynamic content loaded)
        refresh: function() {
            ScrollTrigger.refresh();
        },

        // Setup portfolio item animations
        animatePortfolioItems: function(items) {
            if (!items || !items.length) return;
            gsap.from(items, {
                opacity: 0,
                y: 40,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                onComplete: () => ScrollTrigger.refresh()
            });
        }
    };
})();
