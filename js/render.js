/* =======================================================================
   RENDER DINÂMICO DO CONTEÚDO (content/cv.json)
   Este script busca o arquivo de dados editado pelo Decap CMS e injeta
   o conteúdo nos elementos correspondentes do index.html.
   Ao terminar, dispara o evento "cv:rendered" para que script.js possa
   inicializar as animações (reveal / tilt) sobre os elementos já prontos.
   ======================================================================= */

async function loadCvContent() {
    try {
        const response = await fetch('content/cv.json', { cache: 'no-cache' });
        if (!response.ok) throw new Error('Não foi possível carregar content/cv.json');
        const data = await response.json();
        renderCvContent(data);
    } catch (err) {
        console.error('Erro ao carregar o conteúdo do currículo:', err);
    } finally {
        document.dispatchEvent(new CustomEvent('cv:rendered'));
    }
}

function renderCvContent(data) {
    // ---- Metadados (título da aba e SEO) ----
    if (data.meta_title) {
        document.title = data.meta_title;
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = data.meta_title;
    }
    const pageDescription = document.getElementById('page-description');
    if (pageDescription && data.meta_description) {
        pageDescription.setAttribute('content', data.meta_description);
    }

    // ---- Hero ----
    if (data.hero) {
        setText('hero-subtitle', data.hero.subtitle);
        setText('hero-profession', data.hero.profession);
        setText('hero-description', data.hero.description);
        setText('hero-cta-text', data.hero.cta_text);

        const heroTitle = document.getElementById('hero-title');
        if (heroTitle && data.hero.name_line1 !== undefined) {
            heroTitle.innerHTML = `${escapeHtml(data.hero.name_line1)}<br>${escapeHtml(data.hero.name_line2 || '')}`;
        }

        const heroImg = document.getElementById('hero-img');
        if (heroImg && data.hero.photo) heroImg.src = data.hero.photo;
    }

    // ---- Sobre Mim ----
    if (data.about) {
        const aboutDescription = document.getElementById('about-description');
        if (aboutDescription && data.about.description !== undefined) {
            aboutDescription.innerHTML = textToHtml(data.about.description);
        }

        const infoContainer = document.getElementById('about-info-container');
        if (infoContainer && Array.isArray(data.about.info_boxes)) {
            infoContainer.innerHTML = data.about.info_boxes.map(box => `
                <div class="info-box">
                    <i class="ph ${escapeHtml(box.icon || '')}"></i>
                    <h3 class="info-title">${escapeHtml(box.title || '')}</h3>
                    <span class="info-subtitle">${escapeHtml(box.subtitle || '')}</span>
                </div>
            `).join('');
        }
    }

    // ---- Experiência ----
    renderTimeline('experience-container', data.experience, false);

    // ---- Formação ----
    renderTimeline('education-container', data.education, true);

    // ---- Competências ----
    if (data.skills) {
        renderSkillList('skills-behavioral', data.skills.behavioral);
        renderSkillList('skills-technical', data.skills.technical);

        const coursesContainer = document.getElementById('courses-container');
        if (coursesContainer && Array.isArray(data.skills.courses)) {
            coursesContainer.innerHTML = data.skills.courses.map(course => `
                <div class="course-item">
                    <div class="course-date">${escapeHtml(course.date || '')}</div>
                    <div class="course-info">
                        <h4 class="course-title">${escapeHtml(course.title || '')}</h4>
                        <span class="course-institution">${escapeHtml(course.institution || '')}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // ---- Projetos ----
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer && Array.isArray(data.projects)) {
        projectsContainer.innerHTML = data.projects.map(project => `
            <div class="project-card reveal">
                ${project.image ? `
                <div class="project-img-wrapper">
                    <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title || '')}" class="project-img" loading="lazy">
                </div>` : ''}
                <div class="project-body">
                    <h3 class="project-title">${escapeHtml(project.title || '')}</h3>
                    ${project.description ? `<p class="project-description">${escapeHtml(project.description)}</p>` : ''}
                    ${project.link ? `
                    <a href="${escapeHtml(project.link)}" target="_blank" rel="noopener noreferrer" class="project-link">
                        Ver Projeto <i class="ph ph-arrow-up-right"></i>
                    </a>` : ''}
                </div>
            </div>
        `).join('');
    }

    // ---- Contato ----
    if (data.contact) {
        setText('contact-email-text', data.contact.email);
        const emailLink = document.getElementById('contact-email-link');
        if (emailLink && data.contact.email) emailLink.setAttribute('href', `mailto:${data.contact.email}`);

        setText('contact-linkedin-text', data.contact.linkedin_label);
        const linkedinLink = document.getElementById('contact-linkedin-link');
        if (linkedinLink && data.contact.linkedin_url) linkedinLink.setAttribute('href', data.contact.linkedin_url);

        setText('contact-whatsapp-text', data.contact.whatsapp_label);
        const whatsappLink = document.getElementById('contact-whatsapp-link');
        if (whatsappLink && data.contact.whatsapp_url) whatsappLink.setAttribute('href', data.contact.whatsapp_url);

        const cvLink = document.getElementById('cv-download-link');
        if (cvLink && data.contact.cv_pdf) cvLink.setAttribute('href', data.contact.cv_pdf);
    }
}

/* ---------------- Funções auxiliares ---------------- */

function renderTimeline(containerId, items, isEducation) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(items)) return;

    const dotStyle = isEducation
        ? ' style="background-color: var(--primary-color); box-shadow: 0 0 10px var(--primary-color);"'
        : '';

    container.innerHTML = items.map(item => `
        <div class="timeline-item reveal">
            <div class="timeline-dot"${dotStyle}></div>
            <div class="timeline-content">
                <span class="timeline-date">${escapeHtml(item.date || '')}</span>
                <h3 class="timeline-title">${escapeHtml(item.title || '')}</h3>
                <h4 class="timeline-company">${escapeHtml(item.company || '')}</h4>
                <p class="timeline-description">${escapeHtml(item.description || '')}</p>
            </div>
        </div>
    `).join('');
}

function renderSkillList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(items)) return;
    container.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
}

function setText(elementId, value) {
    if (value === undefined || value === null) return;
    const el = document.getElementById(elementId);
    if (el) el.textContent = value;
}

// Converte quebras de linha duplas em parágrafos/<br> para o campo "Sobre Mim"
function textToHtml(text) {
    return escapeHtml(text).split(/\n\s*\n/).join('<br><br>');
}

function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', loadCvContent);
