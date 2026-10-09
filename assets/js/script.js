// Chorão Eterno — interações da página
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

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
        window.matchMedia('(min-width: 1101px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
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

    /* ---------- Jukebox: player do Spotify, busca, filtros e sorteio ---------- */
    const jukebox = document.querySelector('[data-jukebox]');
    const tracks = [...document.querySelectorAll('[data-tracks] .track')];
    let playTrack = () => {};

    if (jukebox && tracks.length) {
        const screen = jukebox.querySelector('[data-deck-screen]');
        const status = jukebox.querySelector('[data-deck-status]');
        const title = jukebox.querySelector('[data-deck-title]');
        const meta = jukebox.querySelector('[data-deck-meta]');
        const search = document.querySelector('[data-search]');
        const filterBtns = [...document.querySelectorAll('[data-filter]')];
        const count = document.querySelector('[data-count]');
        const empty = document.querySelector('[data-empty]');
        let iframe = null;
        let era = 'all';

        playTrack = (track, { scroll = false } = {}) => {
            const id = track.dataset.spotify;
            if (!id) return;
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.title = 'Player do Spotify';
                iframe.loading = 'lazy';
                iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
                screen.replaceChildren(iframe);
            }
            iframe.src = `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;

            tracks.forEach((t) => t.classList.toggle('is-active', t === track));
            jukebox.classList.add('is-loaded');
            status.textContent = 'No player — aperte o play';
            title.textContent = track.dataset.title;
            meta.textContent = track.dataset.note
                ? `${track.dataset.meta} · versão ${track.dataset.note}`
                : track.dataset.meta;

            if (scroll) {
                const isStacked = window.matchMedia('(max-width: 1024px)').matches;
                (isStacked ? screen : jukebox).scrollIntoView({ behavior: scrollBehavior, block: isStacked ? 'center' : 'start' });
            }
        };

        jukebox.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-play-track]');
            if (!btn) return;
            const track = btn.closest('.track');
            const isStacked = window.matchMedia('(max-width: 1024px)').matches;
            playTrack(track, { scroll: isStacked });
        });

        const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
        const applyFilters = () => {
            const term = normalize(search ? search.value : '');
            let visible = 0;
            tracks.forEach((t) => {
                const matchEra = era === 'all' || t.dataset.era === era;
                const matchTerm = !term || normalize(t.dataset.search).includes(term);
                const show = matchEra && matchTerm;
                t.hidden = !show;
                if (show) visible += 1;
            });
            count.textContent = visible === 1 ? '1 faixa' : `${visible} faixas`;
            empty.hidden = visible > 0;
        };

        filterBtns.forEach((btn) => btn.addEventListener('click', () => {
            era = btn.dataset.filter;
            filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
            applyFilters();
        }));
        if (search) {
            search.addEventListener('input', applyFilters);
            document.addEventListener('keydown', (e) => {
                const typing = e.target.closest('input, textarea, select, [contenteditable="true"]');
                if (e.key === '/' && !typing) {
                    e.preventDefault();
                    search.focus({ preventScroll: true });
                    search.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
                }
            });
        }

        const shuffleBtn = jukebox.querySelector('[data-shuffle]');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                const pool = tracks.filter((t) => !t.hidden && !t.classList.contains('is-active'));
                const list = pool.length ? pool : tracks.filter((t) => !t.classList.contains('is-active'));
                const pick = list[Math.floor(Math.random() * list.length)];
                playTrack(pick);
                pick.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' });
            });
        }

        applyFilters();
    }

    /* ---------- Prateleira de discos ---------- */
    const shelf = document.querySelector('[data-shelf]');
    const detail = document.querySelector('[data-album-detail]');
    if (shelf && detail) {
        const albumBtns = [...shelf.querySelectorAll('[data-album-btn]')];
        const prev = document.querySelector('[data-shelf-prev]');
        const next = document.querySelector('[data-shelf-next]');
        const step = () => Math.max(shelf.clientWidth * 0.8, 200);

        const updateNav = () => {
            prev.disabled = shelf.scrollLeft <= 4;
            next.disabled = shelf.scrollLeft + shelf.clientWidth >= shelf.scrollWidth - 4;
        };
        prev.addEventListener('click', () => shelf.scrollBy({ left: -step(), behavior: scrollBehavior }));
        next.addEventListener('click', () => shelf.scrollBy({ left: step(), behavior: scrollBehavior }));
        shelf.addEventListener('scroll', updateNav, { passive: true });
        window.addEventListener('resize', updateNav);
        updateNav();

        albumBtns.forEach((btn) => btn.addEventListener('click', () => {
            const open = btn.getAttribute('aria-expanded') === 'true';
            albumBtns.forEach((b) => b.setAttribute('aria-expanded', 'false'));
            if (open) {
                detail.hidden = true;
                return;
            }
            btn.setAttribute('aria-expanded', 'true');
            const tpl = shelf.querySelector(`[data-album-tpl="${btn.dataset.albumBtn}"]`);
            detail.replaceChildren(tpl.content.cloneNode(true));
            detail.hidden = false;
            // reinicia a animação de entrada
            detail.style.animation = 'none';
            void detail.offsetWidth;
            detail.style.animation = '';
            const rect = detail.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) detail.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' });
        }));

        detail.addEventListener('click', (e) => {
            const jump = e.target.closest('[data-jump-track]');
            if (!jump) return;
            const track = tracks.find((t) => t.dataset.title.startsWith(jump.dataset.jumpTrack));
            if (!track) return;
            // garante que a faixa esteja visível na lista
            const all = document.querySelector('[data-filter="all"]');
            const search = document.querySelector('[data-search]');
            if (search && search.value) { search.value = ''; search.dispatchEvent(new Event('input')); }
            if (all) all.click();
            playTrack(track, { scroll: true });
        });
    }

    /* ---------- Lado B: curiosidades ---------- */
    const facts = [...document.querySelectorAll('[data-fact]')];
    if (facts.length) {
        const indexEl = document.querySelector('[data-fact-index]');
        let i = 0;
        const show = (n) => {
            facts[i].hidden = true;
            i = (n + facts.length) % facts.length;
            const f = facts[i];
            f.hidden = false;
            f.classList.remove('is-entering');
            void f.offsetWidth;
            f.classList.add('is-entering');
            indexEl.textContent = String(i + 1).padStart(2, '0');
        };
        document.querySelector('[data-fact-prev]').addEventListener('click', () => show(i - 1));
        document.querySelector('[data-fact-next]').addEventListener('click', () => show(i + 1));
    }
});
