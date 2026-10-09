// Chorão Eterno — interações da página
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Header: fundo sólido após rolar ---------- */
    const header = document.querySelector('[data-header]');
    if (header) {
        const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- Menu mobile ---------- */
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-menu]');
    if (toggle && menu) {
        const label = toggle.querySelector('.menu-toggle__label');
        const setOpen = (open) => {
            toggle.setAttribute('aria-expanded', String(open));
            menu.classList.toggle('is-open', open);
            document.body.style.overflow = open ? 'hidden' : '';
            if (label) label.textContent = open ? 'Fechar' : 'Menu';
        };
        toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
        menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) {
                setOpen(false);
                toggle.focus();
            }
        });
        window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
    }

    /* ---------- Revelação ao rolar ---------- */
    const revealables = document.querySelectorAll('[data-reveal]');
    if (!reduceMotion && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
        revealables.forEach((el) => io.observe(el));
    } else {
        revealables.forEach((el) => el.classList.add('is-in'));
    }

    /* ---------- Link ativo na navegação ---------- */
    const navLinks = [...document.querySelectorAll('.nav__list a[href^="#"]')];
    if (navLinks.length && 'IntersectionObserver' in window) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((a) => {
                    a.setAttribute('aria-current', String(a.getAttribute('href') === `#${entry.target.id}`));
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        navLinks.forEach((a) => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) spy.observe(target);
        });
    }

    /* ---------- Player de áudio ---------- */
    const player = document.querySelector('[data-player]');
    const audio = player && player.querySelector('[data-audio]');
    if (player && audio) {
        const ui = player.querySelector('[data-player-ui]');
        const playBtn = player.querySelector('[data-play]');
        const seek = player.querySelector('[data-seek]');
        const current = player.querySelector('[data-current]');
        const duration = player.querySelector('[data-duration]');
        const record = document.querySelector('[data-record]');

        // Com JS, troca os controles nativos pela interface personalizada
        audio.controls = false;
        audio.hidden = true;
        ui.hidden = false;

        const fmt = (s) => {
            if (!Number.isFinite(s)) return '--:--';
            const m = Math.floor(s / 60);
            return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
        };
        const setPlaying = (playing) => {
            player.classList.toggle('is-playing', playing);
            if (record) record.classList.toggle('is-playing', playing);
            playBtn.setAttribute('aria-label', playing ? 'Pausar' : 'Tocar');
        };
        const paintProgress = () => {
            const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
            seek.value = pct;
            seek.style.setProperty('--progress', `${pct}%`);
            seek.setAttribute('aria-valuetext', `${fmt(audio.currentTime)} de ${fmt(audio.duration)}`);
            current.textContent = fmt(audio.currentTime);
        };

        playBtn.addEventListener('click', () => {
            if (audio.paused) audio.play().catch(() => setPlaying(false));
            else audio.pause();
        });
        audio.addEventListener('play', () => setPlaying(true));
        audio.addEventListener('pause', () => setPlaying(false));
        audio.addEventListener('ended', () => { setPlaying(false); audio.currentTime = 0; });
        audio.addEventListener('loadedmetadata', () => { duration.textContent = fmt(audio.duration); paintProgress(); });
        audio.addEventListener('timeupdate', paintProgress);
        seek.addEventListener('input', () => {
            if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
            paintProgress();
        });
        if (audio.readyState >= 1) duration.textContent = fmt(audio.duration);

        // CTA do hero: rola até o player e começa a tocar
        document.querySelectorAll('[data-play-jump]').forEach((link) => {
            link.addEventListener('click', () => {
                if (audio.paused) audio.play().catch(() => {});
                playBtn.focus({ preventScroll: true });
            });
        });
    }
});
