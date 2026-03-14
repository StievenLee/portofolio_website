// ── GSAP Vertical Card Stacking (Hero → About) ──────────────────────────
gsap.registerPlugin(ScrollTrigger);

window.addEventListener('DOMContentLoaded', () => {
    const scrollSection = document.querySelector('.scroll-section.vertical-section');
    if (!scrollSection) return;

    const hero  = scrollSection.querySelector('#home');
    const about = scrollSection.querySelector('#about');
    if (!hero || !about) return;

    // About starts hidden below the viewport
    gsap.set(about, { yPercent: 100 });

    const tl = gsap.timeline({
        scrollTrigger: {
            id: 'heroAboutStack',          // ← named so navbar can find it
            trigger: scrollSection,
            pin: true,
            pinSpacing: true,
            start: 'top top',
            end: '+=100%',
            scrub: 1,
            invalidateOnRefresh: true,
            onLeave: () => {
                gsap.set(hero,  { clearProps: 'all' });
                gsap.set(about, { clearProps: 'all' });
                about.style.position = 'relative';
                about.style.transform = 'none';
            },
            onEnterBack: () => {
                about.style.position = '';
                about.style.transform = '';
                gsap.set(about, { yPercent: 0 });
                gsap.set(hero,  { scale: 0.88, borderRadius: '20px' });
            },
        },
        defaults: { ease: 'none' },
    });

    tl.to(hero,  { scale: 0.88, borderRadius: '20px' })
      .to(about, { yPercent: 0 }, '<');
});


document.addEventListener('DOMContentLoaded', () => {

    // 3D Profile Card Hover Effect
    const bgText = document.querySelector('.hero-bg-text');
    const floatingHeadWrapper = document.querySelector('.hero-image-wrapper');
    const floatingHeadImg = document.querySelector('.hero-img-floating');

    if (floatingHeadWrapper && floatingHeadImg) {
        floatingHeadWrapper.addEventListener('mousemove', (e) => {
            const rect = floatingHeadWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -15; // Max rotation 15deg
            const rotateY = ((x - centerX) / centerX) * 15;

            // Apply 3D rotation to the image
            floatingHeadImg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            floatingHeadImg.style.transition = 'transform 0.1s ease'; // Fast transition for smooth tracking
        });

        floatingHeadWrapper.addEventListener('mouseleave', () => {
            // Reset to flat when mouse leaves
            floatingHeadImg.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            floatingHeadImg.style.transition = 'transform 0.5s ease-out'; // Slower transition for snap back
        });
    }

    // Intersection Observer for Scroll Reveals
    const observerOptions = {
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .project-card').forEach(el => {
        observer.observe(el);
    });

    // Smooth Scroll — GSAP ScrollTo (aware of pinned sections)
    gsap.registerPlugin(ScrollToPlugin);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target   = document.querySelector(targetId);
            if (!target) return;

            if (targetId === '#about') {
                // Get the ScrollTrigger instance for the hero→about stack
                const st = ScrollTrigger.getById('heroAboutStack');
                if (st) {
                    // st.end = the exact scroll position where About is fully visible
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: { y: st.end, autoKill: false },
                        ease: 'power2.inOut',
                    });
                    return;
                }
            }

            // All other sections: scroll normally
            gsap.to(window, {
                duration: 1,
                scrollTo: { y: target, offsetY: 0, autoKill: false },
                ease: 'power2.inOut',
            });
        });
    });

    // Form Feedback
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'SENT! ✅';
            setTimeout(() => {
                btn.innerText = originalText;
                form.reset();
            }, 3000);
        });
    }

    // Vertical Timeline Scroll Animation
    const timeline = document.getElementById('experienceTimeline');
    const timelineProgress = document.getElementById('timelineProgress');

    if (timeline && timelineProgress) {
        window.addEventListener('scroll', () => {
            // Get timeline position relative to viewport
            const rect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate how far we've scrolled into the timeline
            // We want the line to start filling when the top of timeline hits middle of screen (or a bit lower)
            // And finish filling when bottom of timeline hits middle of screen
            const startTrigger = windowHeight * 0.6; // Start when timeline is 60% down the screen
            const distance = startTrigger - rect.top;
            
            // Calculate percentage (0 to 1)
            let percentage = distance / rect.height;
            
            // Clamp between 0 and 1
            percentage = Math.max(0, Math.min(1, percentage));
            
            // Apply scale
            timelineProgress.style.transform = `scaleY(${percentage})`;
            
            // Optional: Also light up dots as the line passes them
            const dots = timeline.querySelectorAll('.timeline-dot');
            dots.forEach(dot => {
                const dotRect = dot.getBoundingClientRect();
                // If dot is above the progress line's current visual bottom
                if (dotRect.top < rect.top + (rect.height * percentage)) {
                    dot.style.backgroundColor = 'var(--accent-color)';
                    dot.style.boxShadow = '0 0 20px rgba(0, 255, 204, 0.8)';
                } else {
                    dot.style.backgroundColor = 'var(--bg-color)';
                    dot.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.5)';
                }
            });
        });
    }
});

