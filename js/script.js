const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= MENU MOBILE ================= */
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navOverlay = document.getElementById('nav-overlay');

function openMenu() {
    navMenu.classList.add('show-menu');
    if (navOverlay) navOverlay.classList.add('show-overlay');
    document.body.classList.add('no-scroll');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
    navMenu.classList.remove('show-menu');
    if (navOverlay) navOverlay.classList.remove('show-overlay');
    document.body.classList.remove('no-scroll');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
}

function onActivate(el, handler) {
    if (!el) return;
    el.addEventListener('click', handler);
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
        }
    });
}

onActivate(navToggle, openMenu);
onActivate(navClose, closeMenu);
if (navOverlay) navOverlay.addEventListener('click', closeMenu);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) closeMenu();
});

document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

/* ================= HEADER COM FUNDO AO ROLAR ================= */
const header = document.getElementById('header');

function scrollHeader() {
    header.classList.toggle('scroll-header', window.scrollY >= 50);
}

/* ================= LINK ATIVO CONFORME A SEÇÃO ================= */
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.scrollY;
    sections.forEach(section => {
        const top = section.offsetTop - 90;
        const link = document.querySelector(`.nav-menu a[href="#${section.id}"]`);
        if (!link) return;
        link.classList.toggle('active-link', scrollY > top && scrollY <= top + section.offsetHeight);
    });
}

let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        scrollHeader();
        scrollActive();
        scrollTicking = false;
    });
}, { passive: true });
scrollHeader();

/* ================= ANIMAÇÃO DE ENTRADA (Intersection Observer) =================
   Pode ser chamado sempre que entrar conteúdo novo no DOM: observa só os
   elementos que ainda não apareceram (observar o mesmo elemento duas vezes não tem efeito). */
const revealObserver = (!prefersReducedMotion && 'IntersectionObserver' in window)
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    : null;

function revealPending({ instant = false } = {}) {
    document.querySelectorAll('.reveal:not(.active), .reveal-delay:not(.active)').forEach(el => {
        if (instant || !revealObserver) el.classList.add('active');
        else revealObserver.observe(el);
    });
}

/* ================= TERMINAL DO TOPO (efeito de digitação) =================
   Mostra os elementos do terminal em ordem; nas linhas de comando, digita
   o comando letra por letra. Com movimento reduzido, mostra tudo de uma vez. */
function initTerminal() {
    const body = document.getElementById('terminal-body');
    if (!body || body.dataset.typed) return;
    body.dataset.typed = 'true';

    const children = [...body.children];
    if (prefersReducedMotion) {
        children.forEach(el => el.classList.add('is-shown'));
        return;
    }

    body.classList.add('is-typing');
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    (async () => {
        for (const el of children) {
            const cmd = el.querySelector('.t-cmd');
            if (!cmd) {
                el.classList.add('is-shown');
                await wait(el.classList.contains('t-comment') ? 250 : 120);
                continue;
            }

            const text = cmd.textContent;
            cmd.textContent = '';
            const caret = document.createElement('span');
            caret.className = 'cursor';
            caret.setAttribute('aria-hidden', 'true');
            cmd.after(caret);
            el.classList.add('is-shown');

            for (const ch of text) {
                cmd.textContent += ch;
                await wait(45 + Math.random() * 55);
            }
            await wait(260);
            caret.remove();
        }
        body.classList.remove('is-typing');
    })();
}

/* ================= TEMA CLARO / ESCURO =================
   O tema inicial é aplicado por um script no <head> (sem "piscar"). */
const themeButton = document.getElementById('theme-button');
const root = document.documentElement;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeButton) {
        themeButton.setAttribute('aria-label', t(theme === 'dark' ? 'theme.toLight' : 'theme.toDark'));
    }
    if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#0b0f14' : '#f6f8fa');
}

applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

if (themeButton) {
    themeButton.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
        try {
            localStorage.setItem('theme', next);
            localStorage.removeItem('selected-theme');
            localStorage.removeItem('selected-icon');
        } catch (e) { /* armazenamento indisponível */ }
    });
}

/* ================= EFEITO 3D NA FOTO ================= */
function apply3DTilt(elements, maxTilt = 8, lift = -6, scale = 1.02) {
    elements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -maxTilt;
            const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * maxTilt;
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${lift}px) scale(${scale})`;
            el.style.transition = 'transform 0.1s ease-out';
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
            el.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        });
    });
}

function initTiltEffects() {
    if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;
    apply3DTilt(document.querySelectorAll('.js-tilt-photo'), 6, -4, 1.02);
}

/* ================= INICIALIZAÇÃO =================
   js/render.js dispara "cv:rendered" depois de montar a página (mesmo se o
   conteúdo não carregar) e "cv:relocalized" depois de uma troca de idioma. */
let pageInitDone = false;

function initPage() {
    if (!pageInitDone) {
        pageInitDone = true;
        initTerminal();
        initTiltEffects();
    }
    revealPending();
    scrollActive();
}

document.addEventListener('cv:rendered', initPage);

// Segurança: se o evento demorar ou nunca disparar, inicializa mesmo assim
// (o "cv:rendered" que chegar depois só revela o conteúdo novo)
window.addEventListener('load', () => setTimeout(initPage, 1500));

// Troca de idioma: o rótulo do botão de tema muda de língua...
document.addEventListener('lang:change', () => {
    applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
});

// ...e o conteúdo montado de novo aparece direto, sem animação de entrada
document.addEventListener('cv:relocalized', () => {
    revealPending({ instant: true });
    const terminal = document.getElementById('terminal-body');
    if (terminal) [...terminal.children].forEach(el => el.classList.add('is-shown'));
    scrollActive();
});

const footerYear = document.getElementById('footer-year');
if (footerYear) footerYear.textContent = new Date().getFullYear();
