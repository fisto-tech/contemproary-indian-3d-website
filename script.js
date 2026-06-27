/**
 * AARANYA ESTATES - Advanced Scripting (Ultra Premium V3)
 * Focus: High-Performance Cinematic Engine, Magnetic Interactions, Professional Pacing
 */

document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initCursor();
    initNavbar();
    initImageSequence();
    initHorizontalScroll();
    initStatsCounter();
    initGeneralAnimations();
    initGalleryLightbox();
    initMagneticButtons();
    initParallaxGallery();
    initContactReveal();
    initBackToTop();
});

// 1. Smooth Scrolling (Lenis)
let lenis;
function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.1,
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
}

// 2. Custom Cursor (Cinematic Logic)
function initCursor() {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    // Use GSAP quickSetter for high-performance updates
    const cursorXSet = gsap.quickSetter(cursor, "x", "px");
    const cursorYSet = gsap.quickSetter(cursor, "y", "px");
    const followerXSet = gsap.quickSetter(follower, "x", "px");
    const followerYSet = gsap.quickSetter(follower, "y", "px");

    // Initialize centering
    gsap.set([cursor, follower], { xPercent: -50, yPercent: -50 });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateCursor() {
        // Dot follows faster
        cursorX += (mouseX - cursorX) * 0.25;
        cursorY += (mouseY - cursorY) * 0.25;
        cursorXSet(cursorX);
        cursorYSet(cursorY);

        // Follower follows with a slight smooth lag, but no CSS transition interference
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        followerXSet(followerX);
        followerYSet(followerY);

        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    const hoverables = document.querySelectorAll('a, .btn, .btn-circle, .menu-trigger, .gallery-item, .horizontal-panel, button');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 0, duration: 0.3 });
            cursor.classList.add('active');
            follower.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 1, duration: 0.3 });
            cursor.classList.remove('active');
            follower.classList.remove('active');
        });
    });
}

// 3. Navigation & Progress Logic
function initNavbar() {
    const nav = document.querySelector('.side-nav-container');
    const sections = document.querySelectorAll('section');
    
    if (!nav) return;

    ScrollTrigger.create({
        start: 'top -50',
        onUpdate: (self) => {
            if (self.direction === 1) nav.classList.add('scrolled');
            else if (window.scrollY < 50) nav.classList.remove('scrolled');
        }
    });

    sections.forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 40%',
            end: 'bottom 40%',
            onToggle: self => {
                if (self.isActive) {
                    if (section.classList.contains('section-dark') || section.classList.contains('sequence-container')) {
                        nav.classList.add('light-mode');
                        document.querySelector('.cursor')?.classList.add('light');
                        document.querySelector('.cursor-follower')?.classList.add('light');
                    } else {
                        nav.classList.remove('light-mode');
                        document.querySelector('.cursor')?.classList.remove('light');
                        document.querySelector('.cursor-follower')?.classList.remove('light');
                    }
                }
            }
        });
    });


    const menuBtn = document.querySelector('.menu-trigger');
    const closeBtn = document.querySelector('.mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-links a');

    const toggleMenu = (open) => {
        if (!mobileMenu) return;
        if (open) {
            mobileMenu.classList.add('active');
            lenis.stop();
        } else {
            mobileMenu.classList.remove('active');
            lenis.start();
        }
    };

    if (menuBtn) menuBtn.addEventListener('click', () => toggleMenu(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
    mobileLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));
}

// 4. Core Architecture: Optimized Image Sequence
function initImageSequence() {
    const canvas = document.getElementById('sequence-canvas');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    
    const frameCount = 360;
    const images = [];
    const sequenceState = { frame: 0 };
    
    let loadedCount = 0;
    const preloader = document.getElementById('preloader');
    const loadingNumber = document.getElementById('loading-number');

    const getFrameUrl = (index) => `frames/${(index + 1).toString().padStart(5, '0')}.webp`;

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        context.scale(dpr, dpr);
        renderFrame(Math.floor(sequenceState.frame));
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function startLoading() {
        lenis.stop();
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                const progress = Math.round((loadedCount / frameCount) * 100);
                if (loadingNumber) loadingNumber.textContent = progress.toString().padStart(2, '0');
                if (loadedCount === 1) renderFrame(0);
                if (loadedCount === frameCount) onFinishLoading();
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === frameCount) onFinishLoading();
            };
            img.src = getFrameUrl(i);
            images.push(img);
        }
    }

    function onFinishLoading() {
        const tl = gsap.timeline({
            delay: 0.5,
            onComplete: () => {
                if (preloader) preloader.style.display = 'none';
                lenis.start();
            }
        });
        
        tl.to('.preloader-stat-container', { opacity: 0, y: -20, duration: 0.8, ease: 'power3.in' });
        tl.to('.panel-left', { xPercent: -100, duration: 1.5, ease: 'expo.inOut' }, '-=0.4');
        tl.to('.panel-right', { xPercent: 100, duration: 1.5, ease: 'expo.inOut' }, '<');
        
        // Start the hero animations exactly as the preloader panels begin to slide open
        tl.add(() => {
            initHeroAnimations();
        }, '-=1.5');
    }

    function renderFrame(index) {
        if (!images[index] || !images[index].complete) return;
        
        const img = images[index];
        const canvasWidth = canvas.clientWidth;
        const canvasHeight = canvas.clientHeight;
        
        const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvasWidth - w) / 2;
        const y = (canvasHeight - h) / 2;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(img, x, y, w, h);
    }

    gsap.to(sequenceState, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
            trigger: '.sequence-container',
            start: 'top top',
            end: '+=250%',
            scrub: 1.2,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
                renderFrame(Math.floor(sequenceState.frame));
                updateHUD(self.progress);
            }
        }
    });

    const popups = document.querySelectorAll('.hud-popup');
    popups.forEach(popup => {
        popup.addEventListener('click', () => {
            const isExpanded = popup.classList.contains('expanded');
            popups.forEach(p => p.classList.remove('expanded'));
            if (!isExpanded) popup.classList.add('expanded');
        });
    });

    function updateHUD(progress) {
        popups.forEach(popup => {
            const start = parseFloat(popup.dataset.start);
            const end = parseFloat(popup.dataset.end);
            if (progress >= start && progress <= end) {
                popup.classList.add('active');
            } else {
                popup.classList.remove('active');
            }
        });
    }

    startLoading();
}

// 5. Hero Reveal Sequence (Redesigned for Split Layout)
function initHeroAnimations() {
    const tl = gsap.timeline();
    
    // Initial State Set
    gsap.set('.hero-visual', { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)', x: -50 });
    gsap.set('.hero-info > *', { opacity: 0, y: 30 });
    
    tl.to('.hero-visual', {
        clipPath: 'polygon(0 0, 100% 0, 93% 100%, 0% 100%)',
        x: 0,
        duration: 2,
        ease: 'expo.inOut'
    });
    
    tl.to('.hero-info > *', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out'
    }, '-=1');
}

// 6. Horizontal Scroll Showcase
function initHorizontalScroll() {
    const wrapper = document.querySelector('.horizontal-scroll-wrapper');
    if (!wrapper) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 1101px)", () => {
        // Desktop horizontal scroll
        gsap.to(wrapper, {
            x: () => -(wrapper.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
                trigger: '.horizontal-showcase',
                start: 'top top',
                end: () => `+=${wrapper.scrollWidth}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1
            }
        });
    });

    mm.add("(max-width: 1100px)", () => {
        // Mobile/Tablet vertical layout - no GSAP animation needed
        // but we ensure the wrapper is reset
        gsap.set(wrapper, { x: 0 });
    });
}

// 7. Numeric Animation
function initStatsCounter() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        ScrollTrigger.create({
            trigger: counter,
            start: 'top 90%',
            onEnter: () => {
                const countObj = { val: 0 };
                gsap.to(countObj, {
                    val: target,
                    duration: 2.5,
                    ease: 'power3.out',
                    onUpdate: () => {
                        counter.textContent = Math.floor(countObj.val);
                    }
                });
            }
        });
    });
}

// 8. Magnetic Buttons Effect
function initMagneticButtons() {
    const magnets = document.querySelectorAll('.btn, .btn-circle, .menu-trigger');
    magnets.forEach(magnet => {
        magnet.addEventListener('mousemove', (e) => {
            const position = magnet.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            gsap.to(magnet, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
        });
        magnet.addEventListener('mouseleave', () => {
            gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
        });
    });
}

// 9. General Section Reveals
function initGeneralAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(reveal => {
        ScrollTrigger.create({
            trigger: reveal,
            start: 'top 85%',
            onEnter: () => reveal.classList.add('active'),
            once: true
        });
    });
}

// 10. Gallery Parallax Engine
function initParallaxGallery() {
    const images = document.querySelectorAll('.gallery-img');
    images.forEach(img => {
        gsap.to(img, {
            y: '20%',
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('.gallery-item'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });
}

// 11. Contact Section Depth Reveal
function initContactReveal() {
    const bgText = document.querySelector('.contact-bg-text');
    if (!bgText) return;

    gsap.fromTo(bgText, {
        x: '10%',
        opacity: 0
    }, {
        x: '-10%',
        opacity: 0.02,
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
        }
    });

    // Animate form elements specifically
    const formGroups = document.querySelectorAll('.contact-form-container .form-group');
    formGroups.forEach((group, i) => {
        gsap.from(group, {
            y: 40,
            opacity: 0,
            duration: 1,
            delay: i * 0.1,
            scrollTrigger: {
                trigger: '.contact-form-container',
                start: 'top 80%',
                once: true
            }
        });
    });
}

// 12. Lightbox
function initGalleryLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('.lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (!lightbox || !lightboxImg) return;

    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        item.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            lenis.stop();
            gsap.fromTo(lightboxImg, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'expo.out' });
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lenis.start();
    };

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
}

// 13. Back to Top with Scroll Progress
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    const progressPath = btn?.querySelector('.progress-circle-bar');
    if (!btn || !progressPath) return;

    // Circumference of r=46 circle is 2 * PI * 46 = ~289
    const pathLength = 289;
    progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
    progressPath.style.strokeDashoffset = pathLength;

    const updateScroll = () => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Toggle visibility based on scroll distance (fade in after 300px)
        if (scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }

        // Calculate progress and update the dashoffset
        if (scrollHeight > 0) {
            const progress = scrollY / scrollHeight;
            const offset = pathLength - (progress * pathLength);
            progressPath.style.strokeDashoffset = offset;
        }
    };

    window.addEventListener('scroll', updateScroll);
    
    // Smooth scroll to top using Lenis instance
    btn.addEventListener('click', () => {
        if (lenis) {
            lenis.scrollTo(0, { duration: 1.5 });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    updateScroll();
}
