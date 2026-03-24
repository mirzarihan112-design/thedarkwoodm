/* ===============================================
   THE DARK WOOD — Main Application
   =============================================== */

(function() {
    'use strict';

    // ---- Preloader ----
    function runPreloader() {
        return new Promise(resolve => {
            const preloader = document.getElementById('preloader');
            const title = preloader.querySelector('.preloader__title');
            const subtitle = preloader.querySelector('.preloader__subtitle');
            const curtainL = preloader.querySelector('.preloader__curtain--left');
            const curtainR = preloader.querySelector('.preloader__curtain--right');

            const tl = gsap.timeline({
                onComplete: () => {
                    preloader.style.pointerEvents = 'none';
                    resolve();
                }
            });

            // Fade in logo
            tl.to(title, {
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out'
            })
            .to(subtitle, {
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.3')
            // Hold for a beat
            .to({}, { duration: 0.6 })
            // Curtain wipe reveal
            .to(title, { opacity: 0, duration: 0.3 }, '+=0')
            .to(subtitle, { opacity: 0, duration: 0.3 }, '<')
            .to(curtainL, {
                x: '-100%',
                duration: 1,
                ease: 'power3.inOut'
            })
            .to(curtainR, {
                x: '100%',
                duration: 1,
                ease: 'power3.inOut'
            }, '<')
            .to(preloader, {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out'
            }, '-=0.3')
            .set(preloader, { display: 'none' });
        });
    }

    // ---- Smooth Scroll (Lenis) ----
    function initSmoothScroll() {
        if (typeof Lenis === 'undefined') {
            console.warn('[DarkWood] Lenis not loaded, using native scroll');
            return null;
        }

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Connect Lenis to GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // Smooth scroll for nav links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    lenis.scrollTo(target, {
                        offset: -72, // navbar height
                        duration: 1.2,
                        easing: (t) => 1 - Math.pow(1 - t, 3)
                    });
                    // Close mobile menu if open
                    closeMobileMenu();
                }
            });
        });

        return lenis;
    }

    // ---- Navbar ----
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        let lastScroll = 0;
        let ticking = false;

        function onScroll() {
            const currentScroll = window.scrollY;

            // Scrolled state (transparent → frosted glass)
            if (currentScroll > 80) {
                navbar.classList.add('is-scrolled');
            } else {
                navbar.classList.remove('is-scrolled');
            }

            // Hide/Show on scroll direction
            if (currentScroll > lastScroll && currentScroll > 300) {
                navbar.classList.remove('is-visible');
            } else {
                navbar.classList.add('is-visible');
            }

            lastScroll = currentScroll;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });

        // Show navbar after preloader (with slight delay)
        setTimeout(() => {
            navbar.classList.add('is-visible');
        }, 100);
    }

    // ---- Scroll Progress Bar ----
    function initScrollProgress() {
        const bar = document.querySelector('.scroll-progress__bar');
        if (!bar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            bar.style.width = scrollPercent + '%';
        }, { passive: true });
    }

    // ---- Mobile Menu ----
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    function toggleMobileMenu() {
        hamburger.classList.toggle('is-active');
        mobileMenu.classList.toggle('is-open');
        document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        hamburger.classList.remove('is-active');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking a link
    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });



    // ---- Initialize Everything ----
    async function init() {
        // Start preloader
        await runPreloader();

        // Init smooth scroll
        initSmoothScroll();

        // Init navbar
        initNavbar();

        // Init scroll progress
        initScrollProgress();


        // Play hero animations
        if (window.heroTimeline) {
            window.heroTimeline.play();
        }

        // Init GSAP animations
        if (window.DWAnimations) {
            window.DWAnimations.init();
        }

        // Init Firebase
        if (window.DWFirebase) {
            window.DWFirebase.init();
        }

        // Refresh ScrollTrigger after everything is loaded
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);
    }

    // Wait for DOM and critical resources
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 250);
    });

})();
