// ── GSAP Plugins ─────────────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ── Let browser handle scroll restoration natively ──────────────────────
// Do NOT use manual scrollRestoration — browser is more reliable than JS
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
}

// ── Main init ─────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {

    // ── Hero → About stacking ─────────────────────────────────────────────
    // #home  : position sticky inside .hero-about-wrapper (CSS)
    // #about : normal flow, slides up naturally over sticky hero
    // GSAP   : only scales hero as about approaches — zero position manipulation
    const hero  = document.querySelector('#home');
    const about = document.querySelector('#about');

    if (hero && about) {
        gsap.timeline({
            scrollTrigger: {
                id: 'heroScale',
                trigger: about,
                start: 'top bottom',   // about enters viewport
                end: 'top top',        // about reaches top of screen
                scrub: 1,
                invalidateOnRefresh: true,
            },
        })
        .to(hero, { scale: 0.88, borderRadius: '20px', ease: 'none' });

        // Tab switch — just refresh, CSS handles everything else
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') ScrollTrigger.refresh();
        });


    }

    // ── 3D Profile Card Hover Effect ─────────────────────────────────────
    const floatingHeadWrapper = document.querySelector('.hero-image-wrapper');
    const floatingHeadImg     = document.querySelector('.hero-img-floating');

    if (floatingHeadWrapper && floatingHeadImg) {
        floatingHeadWrapper.addEventListener('mousemove', (e) => {
            const rect    = floatingHeadWrapper.getBoundingClientRect();
            const centerX = rect.width  / 2;
            const centerY = rect.height / 2;
            const rotateX = ((e.clientY - rect.top  - centerY) / centerY) * -15;
            const rotateY = ((e.clientX - rect.left - centerX) / centerX) *  15;
            floatingHeadImg.style.transform  = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05,1.05,1.05)`;
            floatingHeadImg.style.transition = 'transform 0.1s ease';
        });
        floatingHeadWrapper.addEventListener('mouseleave', () => {
            floatingHeadImg.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
            floatingHeadImg.style.transition = 'transform 0.5s ease-out';
        });
    }

    // ── Intersection Observer — Scroll Reveals ────────────────────────────
    const observer = new IntersectionObserver(
        (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); }),
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal, .project-card').forEach(el => observer.observe(el));

    // ── About Section — fade up stagger on enter ────────────────────────
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
        const aboutItems = [
            aboutSection.querySelector('.section-title'),
            aboutSection.querySelector('.about-image'),
            aboutSection.querySelector('.about-text'),
            aboutSection.querySelector('.stats'),
            aboutSection.querySelector('.ticker-wrap'),
        ].filter(Boolean);

        gsap.set(aboutItems, { opacity: 0, y: 36 });

        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gsap.to(aboutItems, {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        stagger: 0.12,
                        ease: 'power3.out',
                    });
                    aboutObserver.disconnect(); // once only
                }
            });
        }, { threshold: 0.1 });

        aboutObserver.observe(aboutSection);
    }

    // ── Hero Load Animation ───────────────────────────────────────────────
    const heroEl = document.querySelector('#home');
    if (heroEl) {
        const heroItems = [
            heroEl.querySelector('.hero-bg-text'),
            heroEl.querySelector('.hero-image-wrapper'),
            heroEl.querySelector('.hero-description'),
            heroEl.querySelector('.hero-pill-cta'),
        ].filter(Boolean);

        // Start hidden
        gsap.set(heroItems, { opacity: 0, y: 30 });

        // bg-text first, then description + CTA together
        gsap.to(heroItems[0], { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 });
        gsap.to(heroItems[1], { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.25 });
        gsap.to([heroItems[2], heroItems[3]], { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.35 });
    }

    // ── Smooth Scroll ─────────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            gsap.to(window, {
                duration: 1,
                scrollTo: { y: target, offsetY: 0, autoKill: false },
                ease: 'power2.inOut',
            });
        });
    });

    // ── Contact Form Feedback ─────────────────────────────────────────────
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const orig = btn.innerText;
            btn.innerText = 'SENT! ✅';
            setTimeout(() => { btn.innerText = orig; form.reset(); }, 3000);
        });
    }

    // ── Experience Timeline Progress Line ─────────────────────────────────
    const timeline         = document.getElementById('experienceTimeline');
    const timelineProgress = document.getElementById('timelineProgress');

    if (timeline && timelineProgress) {
        const updateTimeline = () => {
            const rect       = timeline.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(1, (window.innerHeight * 0.6 - rect.top) / rect.height));
            timelineProgress.style.transform = `scaleY(${percentage})`;
            timeline.querySelectorAll('.timeline-dot').forEach(dot => {
                const passed = dot.getBoundingClientRect().top < rect.top + (rect.height * percentage);
                dot.style.backgroundColor = passed ? 'var(--accent-color)' : 'var(--bg-color)';
                dot.style.boxShadow       = passed ? '0 0 20px var(--accent-glow-lg)' : '0 0 15px var(--accent-glow-lg)';
            });
        };
        window.addEventListener('scroll', updateTimeline, { passive: true });
    }
});
