/* ================= SHOW MENU (HAMBÚRGUER MOBILE) ================= */
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

/* Show Menu */
if (navToggle) {
    navToggle.addEventListener('click', openMenu);
    navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openMenu();
        }
    });
}

/* Hide Menu */
if (navClose) {
    navClose.addEventListener('click', closeMenu);
    navClose.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeMenu();
        }
    });
}

/* Hide Menu on Overlay Click (Mobile) */
if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
}

/* Hide Menu on Escape Key */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
});

/* Remove Menu on Link Click (Mobile) */
const navLink = document.querySelectorAll('.nav-link');
function linkAction() {
    closeMenu();
}
navLink.forEach(n => n.addEventListener('click', linkAction));

/* ================= FECHAR MENU AO CLICAR EM UM LINK ================= */
const navLinks = document.querySelectorAll('.nav-link');

function linkAction() {
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const navToggle = document.getElementById('nav-toggle');
    
    // Esconde o menu lateral
    navMenu.classList.remove('show-menu');
    
    // Esconde o fundo escuro
    if (navOverlay) {
        navOverlay.classList.remove('show-overlay');
    }
    
    // Devolve o scroll natural da página para os efeitos continuarem funcionando
    document.body.classList.remove('no-scroll');
    
    // Atualiza a acessibilidade do botão hambúrguer
    if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
    }
}

// Adiciona o evento de clique em cada um dos links do menu
navLinks.forEach(link => link.addEventListener('click', linkAction));

/* ================= CHANGE BACKGROUND HEADER ================= */
function scrollHeader() {
    const header = document.getElementById('header') || document.querySelector('.header');
    // When the scroll is greater than 50 viewport height, add the scroll-header class
    if (this.scrollY >= 50) header.classList.add('scroll-header');
    else header.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader);


/* ================= SCROLL SECTIONS ACTIVE LINK ================= */
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 58;
        const sectionId = current.getAttribute('id');
        const sectionsClass = document.querySelector('.nav-menu a[href*=' + sectionId + ']');

        if (sectionsClass) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                sectionsClass.classList.add('active-link');
            } else {
                sectionsClass.classList.remove('active-link');
            }
        }
    });
}
window.addEventListener('scroll', scrollActive);


/* ================= SCROLL REVEAL ANIMATION (Intersection Observer) ================= */
const revealElements = document.querySelectorAll('.reveal, .reveal-delay');

const revealOptions = {
    threshold: 0.1, // trigger when 10% of element is visible
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, revealOptions);

revealElements.forEach(el => {
    revealOnScroll.observe(el);
});

/* ================= DARK LIGHT THEME ================= */
const themeButton = document.getElementById('theme-button');
const lightTheme = 'light-theme';
const iconTheme = 'ph-sun';

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme');
const selectedIcon = localStorage.getItem('selected-icon');

// We obtain the current theme that the interface has by validating the light-theme class
const getCurrentTheme = () => document.body.classList.contains(lightTheme) ? 'light' : 'dark';
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ph-moon' : 'ph-sun';

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the light
  document.body.classList[selectedTheme === 'light' ? 'add' : 'remove'](lightTheme);
  themeButton.classList[selectedIcon === 'ph-moon' ? 'add' : 'remove'](iconTheme);
}

// Activate / deactivate the theme manually with the button
if (themeButton) {
    themeButton.addEventListener('click', () => {
        // Add or remove the light / icon theme
        document.body.classList.toggle(lightTheme);
        themeButton.classList.toggle(iconTheme);
        // We save the theme and the current icon that the user chose
        localStorage.setItem('selected-theme', getCurrentTheme());
        localStorage.setItem('selected-icon', getCurrentIcon());
    });
}

/* ================= 3D TILT EFFECT (JAVASCRIPT) ================= */
function apply3DTilt(elements, maxTilt = 15, lift = -10, scale = 1.02) {
    elements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            // Prevent default CSS hover transform conflict by relying purely on JS for movement
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation limits
            const rotateX = ((y - centerY) / centerY) * -maxTilt;
            const rotateY = ((x - centerX) / centerX) * maxTilt;

            // Apply 3D transform inline
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${lift}px) scale(${scale})`;
            el.style.transition = 'transform 0.1s ease-out'; // Fast response while moving
        });

        el.addEventListener('mouseleave', () => {
            // Smoothly return to original state
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)`;
            el.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        });

        el.addEventListener('mouseenter', () => {
            el.style.transition = 'transform 0.1s ease-out';
        });
    });
}

// Cards de contato: efeito mais acentuado
const tiltCards = document.querySelectorAll('.js-tilt');
apply3DTilt(tiltCards, 15, -10, 1.02);

// Foto de perfil: efeito mais sutil
const tiltPhoto = document.querySelectorAll('.js-tilt-photo');
apply3DTilt(tiltPhoto, 8, -6, 1.03);