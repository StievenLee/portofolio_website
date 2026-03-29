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

    // ── Universal Section Reveal — GSAP ScrollTrigger stagger ────────────
    // One consistent system for ALL sections: fade + slide-up with stagger.
    const sectionAnimations = [
        ['#about',      ['.section-title', '.about-image', '.about-text', '.stats', '.ticker-wrap']],
        ['#achievement', ['.section-title', '.timeline-item']],
        ['#education',  ['.section-title', '.edu-card']],
        ['#projects',   ['.section-title', '.proj-card']],
        ['#contact',    ['.contact-anim-item']],
    ];

    sectionAnimations.forEach(([selector, children]) => {
        const section = document.querySelector(selector);
        if (!section) return;

        const items = children
            .flatMap(sel => [...section.querySelectorAll(sel)])
            .filter(Boolean);

        if (!items.length) return;

        gsap.set(items, { opacity: 0, y: 36 });

        ScrollTrigger.create({
            trigger: section,
            start: 'top 82%',
            once: true,
            onEnter: () => {
                gsap.to(items, {
                    opacity: 1,
                    y: 0,
                    duration: 0.65,
                    stagger: 0.11,
                    ease: 'power3.out',
                });
            },
        });
    });

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
        if (anchor.id === 'email-link') return; // skip email link
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

    // ── Input Sanitasi ────────────────────────────────────────────────────
    // Strip HTML tags, script injections, and dangerous characters
    function sanitize(str) {
        return str
            .replace(/<[^>]*>/g, '')           // strip HTML tags
            .replace(/[<>"'`]/g, '')           // strip dangerous chars
            .replace(/javascript:/gi, '')      // strip js: protocol
            .replace(/on\w+\s*=/gi, '')        // strip event handlers (onclick=, etc)
            .trim();
    }

    // ── Email Validation ──────────────────────────────────────────────────
    const KNOWN_DOMAINS = new Set([
        'gmail.com','googlemail.com',
        'yahoo.com','yahoo.co.id','yahoo.co.uk','yahoo.com.au','yahoo.co.jp',
        'yahoo.com.sg','yahoo.co.in','ymail.com','rocketmail.com',
        'outlook.com','hotmail.com','hotmail.co.id','hotmail.co.uk',
        'live.com','live.co.id','msn.com','windowslive.com',
        'icloud.com','me.com','mac.com',
        'protonmail.com','proton.me',
        'zoho.com','aol.com','mail.com','gmx.com','gmx.net',
        'tutanota.com','fastmail.com','hey.com',
        // Singapore
        'singnet.com.sg','starhub.com.sg','pacific.net.sg','m1.com.sg',
        // Japan
        'docomo.ne.jp','softbank.jp','ezweb.ne.jp',
        // Australia
        'bigpond.com','optusnet.com.au',
        // India
        'rediffmail.com','sify.com',
        // Indonesia edu/corp
        'binus.ac.id','bca.co.id','ui.ac.id','its.ac.id',
        'ugm.ac.id','itb.ac.id','unpad.ac.id','undip.ac.id',
    ]);

    function validateEmail(email) {
        const formatOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
        if (!formatOk) return { valid: false, msg: 'Format email tidak valid. Contoh: nama@gmail.com' };

        const domain = email.split('@')[1].toLowerCase();

        const typoMap = {
            'gmai.com':'gmail.com','gmial.com':'gmail.com','gmal.com':'gmail.com',
            'gamil.com':'gmail.com','gnail.com':'gmail.com','gmail.co':'gmail.com',
            'yaho.com':'yahoo.com','yahooo.com':'yahoo.com',
            'hotmai.com':'hotmail.com','hotmial.com':'hotmail.com',
            'outloo.com':'outlook.com','outlok.com':'outlook.com',
        };
        if (typoMap[domain]) {
            return { valid: false, msg: `Maksud kamu ${typoMap[domain]}? Periksa kembali emailmu.` };
        }

        if (!KNOWN_DOMAINS.has(domain)) {
            return { valid: true, warn: true, msg: `Domain "${domain}" tidak umum. Pastikan emailmu benar.` };
        }

        return { valid: true };
    }

    function setFieldError(input, msg) {
        clearFieldError(input);
        input.classList.add('input-error');
        const err = document.createElement('span');
        err.className = 'input-error-msg';
        err.textContent = msg;
        input.parentNode.appendChild(err);
    }

    function setFieldWarn(input, msg) {
        clearFieldError(input);
        input.classList.add('input-warn');
        const warn = document.createElement('span');
        warn.className = 'input-warn-msg';
        warn.textContent = msg;
        input.parentNode.appendChild(warn);
    }

    function clearFieldError(input) {
        input.classList.remove('input-error', 'input-warn');
        const existing = input.parentNode.querySelector('.input-error-msg, .input-warn-msg');
        if (existing) existing.remove();
    }

    // Live validation on blur
    const emailInput = document.querySelector('.contact-form input[type="email"]');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            if (!emailInput.value.trim()) return clearFieldError(emailInput);
            const result = validateEmail(emailInput.value.trim());
            if (!result.valid)    setFieldError(emailInput, result.msg);
            else if (result.warn) setFieldWarn(emailInput, result.msg);
            else                  clearFieldError(emailInput);
        });
        emailInput.addEventListener('input', () => clearFieldError(emailInput));
    }

    // ── Toast Notification ────────────────────────────────────────────────
    function showToast(message, type = 'success') {
        const existing = document.querySelector('.form-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `form-toast form-toast--${type}`;
        toast.innerHTML = `
            <span class="form-toast-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="form-toast-msg">${message}</span>
        `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('form-toast--show'));
        setTimeout(() => {
            toast.classList.remove('form-toast--show');
            setTimeout(() => toast.remove(), 400);
        }, 4500);
    }

    // ── Contact Form — Honeypot + Sanitasi + Formspree AJAX + WIB ────────
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // ① Honeypot check — bot akan isi field ini, manusia tidak
            const honeypot = form.querySelector('#website_url');
            if (honeypot && honeypot.value.trim() !== '') {
                // Pura-pura sukses agar bot tidak tahu terdeteksi
                showToast('Pesan berhasil terkirim! Saya akan segera menghubungi kamu. 🚀', 'success');
                form.reset();
                return;
            }

            // ② Validasi email
            const emailVal = emailInput ? emailInput.value.trim() : '';
            const result   = validateEmail(emailVal);
            if (!result.valid) {
                setFieldError(emailInput, result.msg);
                emailInput.focus();
                return;
            }
            if (result.warn) setFieldWarn(emailInput, result.msg);

            const btn  = form.querySelector('button');
            const span = btn.querySelector('span');
            const orig = span.innerText;

            // ③ Sanitasi semua input sebelum kirim
            const formData = new FormData(form);
            const cleanData = new FormData();
            for (const [key, value] of formData.entries()) {
                cleanData.append(key, typeof value === 'string' ? sanitize(value) : value);
            }

            // ④ Inject WIB timestamp
            const wibInput = document.getElementById('wib-timestamp');
            if (wibInput) {
                const now      = new Date();
                const datePart = new Intl.DateTimeFormat('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                }).format(now);
                const timePart = new Intl.DateTimeFormat('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                }).format(now);
                cleanData.set('Waktu (WIB)', `${datePart} • ${timePart} WIB`);
            }

            btn.disabled   = true;
            span.innerText = 'Sending...';

            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    body: cleanData,
                    headers: { 'Accept': 'application/json' },
                });

                if (res.ok) {
                    span.innerText = 'SENT! ✅';
                    form.reset();
                    if (emailInput) clearFieldError(emailInput);
                    showToast('Pesan berhasil terkirim! Saya akan segera menghubungi kamu. 🚀', 'success');
                } else {
                    span.innerText = 'Failed ❌';
                    showToast('Gagal mengirim pesan. Silakan coba lagi.', 'error');
                }
            } catch {
                span.innerText = 'Error ❌';
                showToast('Koneksi bermasalah. Periksa internet kamu.', 'error');
            }

            setTimeout(() => {
                span.innerText = orig;
                btn.disabled   = false;
            }, 3500);
        });
    }

    // ── Email Obfuscation — aman dari bot, tetap tampil di browser ──────────
    (function () {
        const u = 'stievenlee0';
        const d = 'gmail' + '.' + 'com';
        const email = u + '@' + d;

        // Tampilkan teks email
        const display = document.getElementById('email-display');
        if (display) display.textContent = email;

        // Set href link ke Gmail Compose
        const link = document.getElementById('email-link');
        if (link) link.href = 'https://mail.google.com/mail/?view=cm&to=' + email;
    })();

    // ── Achievement Timeline Progress Line ─────────────────────────────────
    const timeline         = document.getElementById('achievementTimeline');
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