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
    renderProjects(data.projects);

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

        setText('contact-github-text', data.contact.github_label);
        const githubLink = document.getElementById('contact-github-link');
        if (githubLink && data.contact.github_url) githubLink.setAttribute('href', data.contact.github_url);

        const cvLink = document.getElementById('cv-download-link');
        if (cvLink && data.contact.cv_pdf) cvLink.setAttribute('href', data.contact.cv_pdf);
    }

    // ---- GitHub (carregado à parte, direto da API do GitHub) ----
    loadGithubRepos(data);
}

/* ---------------- Projetos ---------------- */

let cvProjects = [];

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container || !Array.isArray(projects)) return;

    // O projeto marcado como destaque aparece primeiro
    cvProjects = [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

    container.innerHTML = cvProjects.map((project, index) => `
        <article class="project-card${project.featured ? ' project-card--featured' : ''}">
            ${project.image ? `
            <div class="project-img-wrapper">
                ${project.featured ? '<span class="project-badge"><i class="ph ph-star"></i> Destaque</span>' : ''}
                <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title || '')}" class="project-img" loading="lazy">
            </div>` : ''}
            <div class="project-body">
                <h3 class="project-title">${escapeHtml(project.title || '')}</h3>
                ${renderTags(project.tags)}
                ${project.description ? `
                <p class="project-description">${escapeHtml(project.description)}</p>
                <button type="button" class="project-more" data-project="${index}">Ler mais</button>` : ''}
                ${renderProjectActions(project)}
            </div>
        </article>
    `).join('');

    // Na grade de 2 colunas (tablet), um card que sobraria sozinho ocupa a linha inteira
    const regularCards = container.querySelectorAll('.project-card:not(.project-card--featured)');
    if (regularCards.length % 2 === 1) {
        regularCards[regularCards.length - 1].classList.add('project-card--odd');
    }

    container.querySelectorAll('.project-more').forEach(btn => {
        btn.addEventListener('click', () => openProjectModal(cvProjects[Number(btn.dataset.project)]));
    });

    initProjectsCarousel(container);
}

function renderTags(tags) {
    if (!Array.isArray(tags) || !tags.length) return '';
    return `<ul class="project-tags">${tags.map(tag => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>`;
}

function renderProjectActions(project) {
    if (!project.link && !project.repo) return '';
    return `
        <div class="project-actions">
            ${project.link ? `
            <a href="${escapeHtml(project.link)}" target="_blank" rel="noopener noreferrer" class="project-btn project-btn--primary">
                Ver site <i class="ph ph-arrow-up-right"></i>
            </a>` : ''}
            ${project.repo ? `
            <a href="${escapeHtml(project.repo)}" target="_blank" rel="noopener noreferrer" class="project-btn">
                <i class="ph ph-github-logo"></i> Código
            </a>` : ''}
        </div>
    `;
}

function openProjectModal(project) {
    const modal = document.getElementById('project-modal');
    if (!modal || !project) return;

    modal.querySelector('.project-modal-content').innerHTML = `
        ${project.image ? `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title || '')}" class="project-modal-img">` : ''}
        <div class="project-modal-body">
            <h3 class="project-title">${escapeHtml(project.title || '')}</h3>
            ${renderTags(project.tags)}
            <p class="project-modal-description">${escapeHtml(project.description || '')}</p>
            ${renderProjectActions(project)}
        </div>
    `;

    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    document.body.classList.add('no-scroll');
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
}

function initProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;
    modal.querySelector('.project-modal-close').addEventListener('click', closeProjectModal);
    // Fecha ao clicar fora da caixa (no fundo escuro)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeProjectModal();
    });
    modal.addEventListener('close', () => document.body.classList.remove('no-scroll'));
}

// No celular os cards viram um carrossel horizontal; os pontinhos indicam a posição
function initProjectsCarousel(container) {
    const dots = document.getElementById('projects-dots');
    if (!dots) return;
    const cards = [...container.children];

    dots.innerHTML = cards.map((_, i) => `<button type="button" class="projects-dot" aria-label="Ir para o projeto ${i + 1}"></button>`).join('');
    const dotButtons = [...dots.children];

    dotButtons.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            container.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });
        });
    });

    const updateDots = () => {
        const center = container.scrollLeft + container.clientWidth / 2;
        let active = 0;
        cards.forEach((card, i) => {
            if (card.offsetLeft - container.offsetLeft <= center) active = i;
        });
        dotButtons.forEach((dot, i) => dot.classList.toggle('active', i === active));
    };

    container.addEventListener('scroll', updateDots, { passive: true });
    updateDots();
}

/* ---------------- Repositórios do GitHub ---------------- */

const GITHUB_LANG_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#663399',
    Java: '#b07219',
    'C#': '#178600',
    PHP: '#4F5D95',
    'Jupyter Notebook': '#DA5B0B'
};

async function loadGithubRepos(data) {
    const reposContainer = document.getElementById('github-repos');
    const profileContainer = document.getElementById('github-profile');
    if (!reposContainer) return;

    const config = data.github || {};
    const githubUrl = (data.contact && data.contact.github_url) || '';
    const username = (config.username || githubUrl.split('github.com/')[1] || '').replace(/\/.*$/, '').trim();
    const maxRepos = Number(config.max_repos) || 6;
    const hidden = (config.hidden_repos || []).map(name => String(name).toLowerCase().trim());

    if (!username) {
        reposContainer.innerHTML = '<p class="github-status">Usuário do GitHub não configurado.</p>';
        return;
    }

    const profileUrl = `https://github.com/${encodeURIComponent(username)}`;

    try {
        const [user, repos] = await Promise.all([
            fetchGithubCached(`https://api.github.com/users/${encodeURIComponent(username)}`),
            fetchGithubCached(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100`)
        ]);

        if (profileContainer) {
            profileContainer.innerHTML = `
                <img src="${escapeHtml(user.avatar_url)}" alt="${escapeHtml(user.login)}" class="github-avatar" loading="lazy">
                <div class="github-profile-info">
                    <h3 class="github-profile-name">${escapeHtml(user.name || user.login)}</h3>
                    <span class="github-profile-meta">@${escapeHtml(user.login)} · ${user.public_repos} repositórios públicos</span>
                </div>
                <a href="${escapeHtml(user.html_url || profileUrl)}" target="_blank" rel="noopener noreferrer" class="project-link">
                    Ver perfil <i class="ph ph-arrow-up-right"></i>
                </a>
            `;
        }

        const visible = repos
            .filter(repo => !repo.fork && !hidden.includes(repo.name.toLowerCase()))
            .slice(0, maxRepos);

        if (!visible.length) {
            reposContainer.innerHTML = '<p class="github-status">Nenhum repositório público encontrado.</p>';
            return;
        }

        reposContainer.innerHTML = visible.map(repo => {
            const updated = new Date(repo.pushed_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            const langColor = GITHUB_LANG_COLORS[repo.language] || 'var(--primary-color)';
            return `
                <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="repo-card">
                    <div class="repo-header">
                        <i class="ph ph-folder-simple"></i>
                        <span class="repo-name">${escapeHtml(repo.name)}</span>
                        <i class="ph ph-arrow-up-right repo-arrow"></i>
                    </div>
                    <p class="repo-description">${escapeHtml(repo.description || 'Sem descrição.')}</p>
                    <div class="repo-meta">
                        ${repo.language ? `<span><span class="repo-lang-dot" style="background:${langColor}"></span>${escapeHtml(repo.language)}</span>` : ''}
                        ${repo.stargazers_count ? `<span><i class="ph ph-star"></i>${repo.stargazers_count}</span>` : ''}
                        <span><i class="ph ph-clock"></i>Atualizado em ${escapeHtml(updated)}</span>
                    </div>
                </a>
            `;
        }).join('');
    } catch (err) {
        console.error('Erro ao carregar repositórios do GitHub:', err);
        if (profileContainer) profileContainer.innerHTML = '';
        reposContainer.innerHTML = `<p class="github-status">Não foi possível carregar os repositórios agora. <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">Ver no GitHub</a></p>`;
    }
}

// A API pública do GitHub permite 60 requisições/hora por visitante,
// então guardamos a resposta por 1 hora na sessão do navegador.
async function fetchGithubCached(url) {
    const key = `gh-cache:${url}`;
    try {
        const cached = JSON.parse(sessionStorage.getItem(key));
        if (cached && Date.now() - cached.time < 3600000) return cached.data;
    } catch (e) { /* sessionStorage indisponível */ }

    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error(`GitHub respondeu ${response.status}`);
    const data = await response.json();

    try {
        sessionStorage.setItem(key, JSON.stringify({ time: Date.now(), data }));
    } catch (e) { /* sessionStorage indisponível */ }
    return data;
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

document.addEventListener('DOMContentLoaded', () => {
    initProjectModal();
    loadCvContent();
});
