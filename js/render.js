/* =======================================================================
   RENDER DINÂMICO DO CONTEÚDO
   Busca os arquivos editados pelo Decap CMS e monta o index.html:
     content/cv.json ou content/cv.en.json -> textos do idioma atual
     content/geral.json                    -> contato, GitHub, foto e PDFs
   Ao terminar, dispara "cv:rendered" (primeira carga) ou "cv:relocalized"
   (troca de idioma) para que script.js cuide das animações.
   ======================================================================= */

async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Não foi possível carregar ${url} (${response.status})`);
    return response.json();
}

// Textos do idioma atual; se o arquivo em inglês falhar, usa o português
async function fetchCvData(lang) {
    try {
        return await fetchJson(I18N_CONTENT[lang]);
    } catch (err) {
        if (lang === 'pt') throw err;
        console.warn(err);
        return fetchJson(I18N_CONTENT.pt);
    }
}

// geral.json não muda com o idioma: é buscado uma vez só.
// Se falhar, a página segue com os textos e tenta de novo na próxima troca de idioma.
let sharedDataPromise = null;

function fetchSharedData() {
    if (!sharedDataPromise) {
        sharedDataPromise = fetchJson('content/geral.json').catch(err => {
            console.warn(err);
            sharedDataPromise = null;
            return {};
        });
    }
    return sharedDataPromise;
}

async function loadCvContent(eventName = 'cv:rendered') {
    try {
        const [data, shared] = await Promise.all([fetchCvData(currentLang), fetchSharedData()]);
        data.contact = shared.contact;
        data.github = shared.github;
        if (shared.photo) data.hero = { ...data.hero, photo: shared.photo };
        renderCvContent(data);
    } catch (err) {
        console.error('Erro ao carregar o conteúdo do currículo:', err);
    } finally {
        document.dispatchEvent(new CustomEvent(eventName));
    }
}

// Troca de idioma: monta a página de novo com o outro JSON
document.addEventListener('lang:change', () => loadCvContent('cv:relocalized'));

function renderCvContent(data) {
    // ---- Metadados ----
    if (data.meta_title) document.title = data.meta_title;
    const pageDescription = document.getElementById('page-description');
    if (pageDescription && data.meta_description) {
        pageDescription.setAttribute('content', data.meta_description);
    }

    renderHero(data.hero, data.contact);
    renderAbout(data.about);
    renderProjects(data.projects);
    renderStack(data.skills);
    renderLog('experience-container', data.experience);
    renderLog('education-container', data.education);
    renderCourses(data.skills && data.skills.courses);
    renderContact(data.contact);

    // GitHub é carregado à parte, direto da API pública
    loadGithubRepos(data);
}

/* ---------------- Hero (terminal) ---------------- */

function renderHero(hero, contact) {
    if (!hero) return;

    if (hero.subtitle) setText('hero-subtitle', `# ${hero.subtitle}`);
    setText('hero-profession', hero.profession);
    setText('hero-description', hero.description);
    setText('hero-cta-text', hero.cta_text);

    if (hero.name_line1 !== undefined) {
        const name = [hero.name_line1, hero.name_line2].filter(Boolean).join(' ');
        setText('hero-title', name);
    }

    const heroImg = document.getElementById('hero-img');
    if (heroImg && hero.photo) heroImg.src = hero.photo;

    const githubLink = document.getElementById('hero-github-link');
    if (githubLink && contact && contact.github_url) githubLink.href = contact.github_url;

    // Linhas extras do terminal (comando + saída), editáveis no CMS
    const body = document.getElementById('terminal-body');
    if (body && Array.isArray(hero.terminal_lines)) {
        body.querySelectorAll('[data-extra]').forEach(el => el.remove());
        const last = body.querySelector('.t-last');
        if (!last) return;
        const html = hero.terminal_lines
            .filter(line => line && line.cmd)
            .map(line => `
                <p class="t-line" data-extra><span class="t-prompt">~ $</span> <span class="t-cmd">${escapeHtml(line.cmd)}</span></p>
                ${line.output ? `<p class="t-out" data-extra>${escapeHtml(line.output)}</p>` : ''}
            `).join('');
        last.insertAdjacentHTML('beforebegin', html);
    }
}

/* ---------------- Sobre (texto + objeto de código) ---------------- */

function renderAbout(about) {
    if (!about) return;

    const aboutDescription = document.getElementById('about-description');
    if (aboutDescription && about.description !== undefined) {
        aboutDescription.innerHTML = textToParagraphs(about.description);
    }

    const code = document.getElementById('about-info-container');
    if (code && Array.isArray(about.info_boxes)) {
        const lines = [
            `<span class="tok-kw">const</span> <span class="tok-var">nathan</span> <span class="tok-punc">= {</span>`,
            ...about.info_boxes.map(box =>
                `  <span class="tok-prop">${escapeHtml(toIdentifier(box.title))}</span><span class="tok-punc">:</span> <span class="tok-str">"${escapeHtml(box.subtitle || '')}"</span><span class="tok-punc">,</span>`
            ),
            `<span class="tok-punc">};</span>`
        ];
        code.innerHTML = lines.map(line => `<span class="code-line">${line}</span>`).join('');
    }
}

// "Localização" -> "localizacao", "Área de atuação" -> "area_de_atuacao"
function toIdentifier(text) {
    const id = stripAccents(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    return id || 'info';
}

/* ---------------- Projetos ---------------- */

let cvProjects = [];

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container || !Array.isArray(projects)) return;

    // O projeto marcado como destaque aparece primeiro
    cvProjects = [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

    container.innerHTML = cvProjects.map((project, index) => `
        <article class="project-card window${project.featured ? ' project-card--featured' : ''}">
            <div class="window-bar">
                <span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="window-title">${escapeHtml(t('projects.path'))}${escapeHtml(toSlug(project.title))}</span>
                ${project.featured ? `<span class="project-badge"><i class="ph ph-star"></i> ${escapeHtml(t('projects.featured'))}</span>` : ''}
            </div>
            <div class="project-inner">
                ${renderProjectMedia(project)}
                <div class="project-body">
                    <h3 class="project-title">${escapeHtml(project.title || '')}</h3>
                    ${renderTags(project.tags)}
                    ${project.description ? `
                    <p class="project-description">${escapeHtml(project.description)}</p>
                    <button type="button" class="project-more" data-project="${index}">${escapeHtml(t('projects.more'))}</button>` : ''}
                    ${renderProjectActions(project)}
                </div>
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

function renderProjectMedia(project) {
    if (project.image) {
        return `
            <div class="project-img-wrapper">
                <img src="${escapeHtml(project.image)}" alt="${escapeHtml(t('projects.imgAlt'))} ${escapeHtml(project.title || '')}" class="project-img" loading="lazy">
            </div>`;
    }
    // Sem imagem: mostra um "terminal" com o nome do projeto e as tecnologias
    const slug = escapeHtml(toSlug(project.title));
    const tags = Array.isArray(project.tags) ? project.tags.slice(0, 4).map(escapeHtml).join(' · ') : '';
    return `
        <div class="project-img-wrapper project-placeholder" aria-hidden="true">
            <pre><span class="t-prompt">$</span> git clone ${slug}
<span class="t-prompt">$</span> cd ${slug} &amp;&amp; npm run dev
${tags ? `<span class="ok">✓</span> ${tags}` : ''}
<span class="ok">✓</span> ${escapeHtml(t('projects.ready'))}</pre>
        </div>`;
}

function renderTags(tags) {
    if (!Array.isArray(tags) || !tags.length) return '';
    return `<ul class="project-tags">${tags.map(tag => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>`;
}

function renderProjectActions(project) {
    const link = (project.link || '').trim();
    const repo = (project.repo || '').trim();
    if (!link && !repo) return '';
    return `
        <div class="project-actions">
            ${link ? `
            <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="project-btn project-btn--primary">
                ${escapeHtml(t('projects.live'))} <i class="ph ph-arrow-up-right"></i>
            </a>` : ''}
            ${repo ? `
            <a href="${escapeHtml(repo)}" target="_blank" rel="noopener noreferrer" class="project-btn">
                <i class="ph ph-github-logo"></i> ${escapeHtml(t('projects.code'))}
            </a>` : ''}
        </div>
    `;
}

function openProjectModal(project) {
    const modal = document.getElementById('project-modal');
    if (!modal || !project) return;

    modal.querySelector('.project-modal-content').innerHTML = `
        ${project.image ? `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(t('projects.imgAlt'))} ${escapeHtml(project.title || '')}" class="project-modal-img">` : ''}
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
    document.body.classList.remove('no-scroll');
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

// No celular os cards viram um carrossel horizontal; os pontinhos indicam a posição.
// Pode ser chamado de novo (troca de idioma): o listener de rolagem é registrado uma vez só.
function initProjectsCarousel(container) {
    const dots = document.getElementById('projects-dots');
    if (!dots) return;

    dots.innerHTML = [...container.children]
        .map((_, i) => `<button type="button" class="projects-dot" data-index="${i}" aria-label="${escapeHtml(t('projects.goTo'))} ${i + 1}"></button>`)
        .join('');

    if (!container.dataset.carousel) {
        container.dataset.carousel = 'true';
        container.addEventListener('scroll', () => updateProjectDots(container, dots), { passive: true });
        dots.addEventListener('click', (e) => {
            const dot = e.target.closest('.projects-dot');
            if (!dot) return;
            const cards = container.children;
            const card = cards[Number(dot.dataset.index)];
            if (card) container.scrollTo({ left: card.offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });
        });
    }

    updateProjectDots(container, dots);
}

function updateProjectDots(container, dots) {
    const center = container.scrollLeft + container.clientWidth / 2;
    let active = 0;
    [...container.children].forEach((card, i) => {
        if (card.offsetLeft - container.offsetLeft <= center) active = i;
    });
    [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === active));
}

/* ---------------- Stack ---------------- */

const STACK_CATEGORY_ORDER = ['Linguagens', 'Web', 'IA', 'Ferramentas'];

function renderStack(skills) {
    const container = document.getElementById('stack-container');
    if (!container || !skills) return;

    // skills.stack = [{ name, icon, category }]
    const items = Array.isArray(skills.stack) ? skills.stack : [];
    const groups = new Map();
    items.forEach(item => {
        if (!item || !item.name) return;
        const category = item.category || 'Ferramentas';
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push(item);
    });

    const ordered = [...groups.keys()].sort((a, b) => {
        const ia = STACK_CATEGORY_ORDER.indexOf(a);
        const ib = STACK_CATEGORY_ORDER.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    container.innerHTML = ordered.map(category => `
        <div class="stack-group">
            <h3 class="stack-group-title">// <span>${escapeHtml(stackCategoryLabel(category))}</span></h3>
            <ul class="stack-list">
                ${groups.get(category).map(item => `
                    <li class="stack-chip">${renderStackIcon(item.icon)}${escapeHtml(item.name)}</li>
                `).join('')}
            </ul>
        </div>
    `).join('');

    const soft = document.getElementById('soft-skills');
    if (soft && Array.isArray(skills.behavioral) && skills.behavioral.length) {
        soft.innerHTML = `<span class="soft-skills-label">${escapeHtml(t('stack.soft'))}</span>` +
            skills.behavioral.map(s => `<span class="soft-skill">${escapeHtml(s)}</span>`).join('');
    }
}

// As categorias ficam em português no JSON (opções do CMS); o nome exibido é traduzido
function stackCategoryLabel(category) {
    const key = `stack.cat.${category}`;
    const label = t(key);
    return label === key ? String(category).toLowerCase() : label;
}

// Aceita classes do Devicon ("devicon-python-plain") ou do Phosphor ("ph-database")
function renderStackIcon(icon) {
    const name = String(icon || '').trim();
    if (/^devicon-[a-z0-9-]+$/.test(name)) return `<i class="${name}" aria-hidden="true"></i>`;
    if (/^ph-[a-z0-9-]+$/.test(name)) return `<i class="ph ${name}" aria-hidden="true"></i>`;
    return '<i class="ph ph-code" aria-hidden="true"></i>';
}

/* ---------------- Experiência / Formação (git log) ---------------- */

function renderLog(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(items)) return;

    container.innerHTML = items.map(item => {
        const isCurrent = /atual|present|current/i.test(item.date || '');
        return `
            <article class="log-item reveal">
                <span class="log-dot" aria-hidden="true"></span>
                <div class="log-content">
                    <p class="log-meta">
                        <span class="log-hash" aria-hidden="true">${shortHash(`${item.title}${item.company}`)}</span>
                        ${isCurrent ? `<span class="log-ref">${escapeHtml(t('exp.current'))}</span>` : ''}
                        <span class="log-date">${escapeHtml(item.date || '')}</span>
                    </p>
                    <h3 class="log-title">${escapeHtml(item.title || '')}</h3>
                    <p class="log-company">@ ${escapeHtml(item.company || '')}</p>
                    <p class="log-description">${escapeHtml(item.description || '')}</p>
                </div>
            </article>
        `;
    }).join('');
}

// "Hash" decorativo de 7 caracteres, sempre igual para o mesmo item
function shortHash(text) {
    let h = 2166136261;
    for (const ch of String(text)) {
        h ^= ch.codePointAt(0);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

/* ---------------- Cursos (mais recentes primeiro) ---------------- */

const MONTHS_PT = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MONTHS_EN = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

function renderCourses(courses) {
    const container = document.getElementById('courses-container');
    if (!container || !Array.isArray(courses)) return;

    const sorted = courses
        .map((course, index) => ({ course, index, key: courseSortKey(course) }))
        .sort((a, b) => (b.key - a.key) || (a.index - b.index))
        .map(entry => entry.course);

    container.innerHTML = sorted.map(course => `
        <li class="course-row">
            <span class="course-date">${escapeHtml(course.date || '')}</span>
            <span class="course-title">${escapeHtml(course.title || '')}</span>
            <span class="course-institution">${escapeHtml(course.institution || '')}</span>
        </li>
    `).join('');
}

// Usa sort_date ("2026-10") ou, se não houver, tenta ler "Outubro 2026"
function courseSortKey(course) {
    const explicit = /^(\d{4})-(\d{1,2})/.exec(course.sort_date || '');
    if (explicit) return Number(explicit[1]) * 12 + Number(explicit[2]);

    const text = stripAccents(course.date).toLowerCase();
    const year = /(\d{4})/.exec(text);
    if (!year) return 0;
    let month = MONTHS_PT.findIndex(m => text.includes(m));
    if (month === -1) month = MONTHS_EN.findIndex(m => text.includes(m));
    return Number(year[1]) * 12 + (month + 1);
}

/* ---------------- Contato ---------------- */

function renderContact(contact) {
    if (!contact) return;

    setText('contact-email-text', contact.email);
    setHref('contact-email-link', contact.email && `mailto:${contact.email}`);

    setText('contact-linkedin-text', contact.linkedin_label);
    setHref('contact-linkedin-link', contact.linkedin_url);

    setText('contact-whatsapp-text', contact.whatsapp_label);
    setHref('contact-whatsapp-link', contact.whatsapp_url);

    setText('contact-github-text', contact.github_label);
    setHref('contact-github-link', contact.github_url);

    // Currículo no idioma atual em destaque; o do outro idioma ao lado
    const pdfs = { pt: contact.cv_pdf, en: contact.cv_pdf_en };
    const otherLang = currentLang === 'en' ? 'pt' : 'en';
    setHref('cv-download-link', pdfs[currentLang] || pdfs.pt);
    setHref('cv-download-other', pdfs[otherLang]);
    const other = document.getElementById('cv-download-other');
    if (other) {
        other.hidden = !pdfs[otherLang];
        other.setAttribute('hreflang', otherLang === 'en' ? 'en' : 'pt-BR');
    }
}

/* ---------------- GitHub ---------------- */

const GITHUB_LANG_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#663399',
    Java: '#b07219',
    'C#': '#178600',
    PHP: '#4F5D95',
    'Jupyter Notebook': '#DA5B0B',
    Shell: '#89e051',
    SQL: '#e38c00',
    Vue: '#41b883'
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
        reposContainer.innerHTML = `<p class="github-status">${escapeHtml(t('gh.noUser'))}</p>`;
        return;
    }

    const profileUrl = `https://github.com/${encodeURIComponent(username)}`;

    // O calendário de contribuições vem de outra fonte e não bloqueia o resto
    loadContributions(username);

    try {
        const [user, repos] = await Promise.all([
            fetchJsonCached(`https://api.github.com/users/${encodeURIComponent(username)}`),
            fetchJsonCached(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100`)
        ]);

        const ownRepos = repos.filter(repo => !repo.fork && !hidden.includes(repo.name.toLowerCase()));
        const stars = ownRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const languages = await measureLanguages(ownRepos);

        if (profileContainer) {
            profileContainer.innerHTML = `
                <img src="${escapeHtml(user.avatar_url)}" alt="" class="github-avatar" loading="lazy" width="56" height="56">
                <div class="github-profile-info">
                    <h3 class="github-profile-name">${escapeHtml(user.name || user.login)}</h3>
                    <span class="github-profile-meta">@${escapeHtml(user.login)}</span>
                </div>
                <div class="github-stats">
                    <div class="github-stat"><strong>${Number(user.public_repos) || 0}</strong><span>${escapeHtml(t('gh.repos'))}</span></div>
                    ${languages.length ? `<div class="github-stat"><strong>${languages.length}</strong><span>${escapeHtml(t('gh.languages'))}</span></div>` : ''}
                    ${stars ? `<div class="github-stat"><strong>${stars}</strong><span>${escapeHtml(t('gh.stars'))}</span></div>` : ''}
                    ${languages.length ? `<div class="github-stat"><strong>${escapeHtml(languages[0].name)}</strong><span>${escapeHtml(t('gh.mainLang'))}</span></div>` : ''}
                </div>
                <a href="${escapeHtml(user.html_url || profileUrl)}" target="_blank" rel="noopener noreferrer" class="project-btn">
                    <i class="ph ph-github-logo"></i> ${escapeHtml(t('gh.profile'))} <i class="ph ph-arrow-up-right"></i>
                </a>
            `;
        }

        renderLanguageStats(languages);

        const visible = ownRepos.slice(0, maxRepos);
        if (!visible.length) {
            reposContainer.innerHTML = `<p class="github-status">${escapeHtml(t('gh.empty'))}</p>`;
            return;
        }

        reposContainer.innerHTML = visible.map(repo => {
            const updated = new Date(repo.pushed_at).toLocaleDateString(getLocale(), { month: 'short', year: 'numeric' });
            const langColor = GITHUB_LANG_COLORS[repo.language] || 'var(--accent)';
            return `
                <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="repo-card">
                    <div class="repo-header">
                        <i class="ph ph-git-branch" aria-hidden="true"></i>
                        <span class="repo-name">${escapeHtml(repo.name)}</span>
                        <i class="ph ph-arrow-up-right repo-arrow" aria-hidden="true"></i>
                    </div>
                    <p class="repo-description">${escapeHtml(repo.description || t('gh.noDescription'))}</p>
                    <div class="repo-meta">
                        ${repo.language ? `<span><span class="lang-dot" style="background:${langColor}"></span>${escapeHtml(repo.language)}</span>` : ''}
                        ${repo.stargazers_count ? `<span><i class="ph ph-star"></i>${repo.stargazers_count}</span>` : ''}
                        <span><i class="ph ph-clock"></i>${escapeHtml(updated)}</span>
                    </div>
                </a>
            `;
        }).join('');
    } catch (err) {
        console.error('Erro ao carregar repositórios do GitHub:', err);
        if (profileContainer) profileContainer.innerHTML = '';
        reposContainer.innerHTML = `<p class="github-status">${escapeHtml(t('gh.error'))} <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('gh.seeOnGithub'))}</a></p>`;
    }
}

// Soma o volume de código (bytes) de cada linguagem em todos os repositórios.
// Se a API de linguagens falhar, conta a linguagem principal de cada repositório.
async function measureLanguages(repos) {
    const results = await Promise.allSettled(repos.map(repo => fetchJsonCached(repo.languages_url)));
    const totals = {};
    const add = (name, value) => { totals[name] = (totals[name] || 0) + Number(value || 0); };

    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
            Object.entries(result.value).forEach(([name, bytes]) => add(name, bytes));
        }
    });

    if (!Object.keys(totals).length) {
        repos.forEach(repo => { if (repo.language) add(repo.language, 1); });
    }

    return Object.entries(totals)
        .filter(([, count]) => count > 0)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
}

function renderLanguageStats(languages) {
    const container = document.getElementById('lang-stats');
    const activity = document.getElementById('github-activity');
    if (!container || !languages.length) return;

    const total = languages.reduce((sum, l) => sum + l.count, 0);
    // Linguagens com menos de 1% viram "outras" para a legenda não poluir
    const main = languages.filter(l => l.count / total >= 0.01);
    const rest = total - main.reduce((sum, l) => sum + l.count, 0);
    const list = rest > 0 ? [...main, { name: t('gh.others'), count: rest }] : main;

    const withPct = list.map(l => ({
        ...l,
        pct: Math.round((l.count / total) * 1000) / 10,
        color: GITHUB_LANG_COLORS[l.name] || 'var(--text-muted)'
    }));

    container.innerHTML = `
        <div class="lang-bar" role="img" aria-label="${escapeHtml(t('gh.langAria'))}: ${withPct.map(l => `${escapeHtml(l.name)} ${l.pct}%`).join(', ')}">
            ${withPct.map(l => `<span style="width:${l.pct}%;background:${l.color}"></span>`).join('')}
        </div>
        <ul class="lang-legend">
            ${withPct.map(l => `<li><span class="lang-dot" style="background:${l.color}"></span>${escapeHtml(l.name)} <small>${l.pct}%</small></li>`).join('')}
        </ul>
    `;
    if (activity) activity.hidden = false;
}

// Calendário de contribuições (API pública github-contributions-api.jogruber.de)
async function loadContributions(username) {
    const grid = document.getElementById('contrib-grid');
    const activity = document.getElementById('github-activity');
    if (!grid) return;

    try {
        const data = await fetchJsonCached(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`);
        const days = Array.isArray(data.contributions) ? data.contributions : [];
        if (!days.length) return;

        // A primeira coluna começa no domingo: preenche os dias antes do primeiro com células vazias
        const firstWeekday = new Date(`${days[0].date}T12:00:00`).getDay();
        const cells = [];
        for (let i = 0; i < firstWeekday; i++) cells.push('<span class="contrib-cell contrib-cell--empty"></span>');
        days.forEach(day => {
            const level = Math.max(0, Math.min(4, Number(day.level) || 0));
            const label = t(day.count === 1 ? 'gh.contribDay1' : 'gh.contribDayN', { n: day.count, date: formatDate(day.date) });
            cells.push(`<span class="contrib-cell" data-level="${level}" title="${escapeHtml(label)}"></span>`);
        });
        grid.innerHTML = cells.join('');

        const total = data.total && (data.total.lastYear ?? Object.values(data.total)[0]);
        if (total !== undefined) {
            setText('contrib-title', t('gh.contribTotal', { n: total }));
            grid.setAttribute('aria-label', t('gh.contribAria', { n: total }));
        }

        const legend = document.getElementById('contrib-legend');
        if (legend) legend.hidden = false;
        if (activity) activity.hidden = false;

        // No celular a grade rola na horizontal: começa mostrando as semanas mais recentes
        const scroller = document.getElementById('contrib-scroll');
        if (scroller) scroller.scrollLeft = scroller.scrollWidth;
    } catch (err) {
        console.warn('Calendário de contribuições indisponível:', err);
        const scroller = document.getElementById('contrib-scroll');
        if (scroller) scroller.hidden = true;
    }
}

function formatDate(iso) {
    const date = new Date(`${iso}T12:00:00`);
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' });
}

// A API pública do GitHub permite 60 requisições/hora por visitante,
// então guardamos as respostas por 1 hora na sessão do navegador.
async function fetchJsonCached(url) {
    const key = `gh-cache:${url}`;
    try {
        const cached = JSON.parse(sessionStorage.getItem(key));
        if (cached && Date.now() - cached.time < 3600000) return cached.data;
    } catch (e) { /* sessionStorage indisponível */ }

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`${url} respondeu ${response.status}`);
    const data = await response.json();

    try {
        sessionStorage.setItem(key, JSON.stringify({ time: Date.now(), data }));
    } catch (e) { /* sessionStorage indisponível ou cheio */ }
    return data;
}

/* ---------------- Funções auxiliares ---------------- */

function setText(elementId, value) {
    if (value === undefined || value === null) return;
    const el = document.getElementById(elementId);
    if (el) el.textContent = value;
}

function setHref(elementId, value) {
    if (!value) return;
    const el = document.getElementById(elementId);
    if (el) el.setAttribute('href', value);
}

// "Sobre Mim": linha em branco separa parágrafos, quebra simples vira <br>
// e **texto** fica em destaque
function textToParagraphs(text) {
    return escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong class="highlight">$1</strong>')
        .split(/\n\s*\n/)
        .map(paragraph => `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>`)
        .join('');
}

function toSlug(text) {
    return toIdentifier(text).replace(/_/g, '-');
}

// "Formação" -> "Formacao"
function stripAccents(text) {
    return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
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
