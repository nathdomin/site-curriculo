/* =======================================================================
   IDIOMAS (PT / EN)
   - Conteúdo: content/cv.json (português) e content/cv.en.json (inglês),
     ambos editáveis pelo Decap CMS.
   - Textos fixos da interface: dicionário abaixo, aplicado nos elementos
     com data-i18n="chave" (texto) e data-i18n-attr="atributo:chave".
   - Escolha: ?lang=en na URL > escolha salva > idioma do navegador.
   ======================================================================= */

const I18N_STRINGS = {
    pt: {
        'skip': 'Pular para o conteúdo',
        'nav.label': 'Navegação principal',
        'nav.home': 'Início',
        'nav.open': 'Abrir menu',
        'nav.close': 'Fechar menu',
        'nav.path': '~/navegacao',
        'nav.about': 'sobre',
        'nav.projects': 'projetos',
        'nav.stack': 'stack',
        'nav.experience': 'experiência',
        'nav.education': 'formação',
        'nav.github': 'github',
        'nav.contact': 'contato',
        'lang.switch': 'Switch to English',
        'theme.toLight': 'Mudar para tema claro',
        'theme.toDark': 'Mudar para tema escuro',

        'hero.roleCmd': 'cat cargo.txt',
        'hero.cv': 'Baixar currículo',
        'hero.photoTitle': '~/fotos/nathan.png',

        'term.hint': '# digite help para ver os comandos',
        'term.inputLabel': 'Digite um comando do terminal',
        'term.help.title': 'comandos disponíveis:',
        'term.help.section': '<seção>',
        'term.help.whoami': 'quem sou eu',
        'term.help.ls': 'listar as seções',
        'term.help.cv': 'baixar meu currículo em PDF',
        'term.help.lang': 'ver o site em inglês',
        'term.help.theme': 'alternar tema claro/escuro',
        'term.help.clear': 'limpar o terminal',
        'term.ls': 'sobre/  projetos/  stack/  experiencia/  formacao/  github/  contato/',
        'term.goto': 'abrindo {section}/ ...',
        'term.cv': 'baixando currículo em português.pdf ...',
        'term.langUsage': 'uso: lang pt | lang en',
        'term.langSame': 'o site já está em português',
        'term.langTo.en': 'switching to English...',
        'term.langTo.pt': 'mudando para português...',
        'term.themeUsage': 'uso: theme light | theme dark',
        'term.themeSet': 'tema: {theme}',
        'term.notFound': 'comando não encontrado: {cmd}. digite help',
        'term.sudo': 'nathan não está no arquivo sudoers. este incidente será reportado. 😉',
        'hero.photoAlt': 'Foto de Nathan Domingues',

        'about.tab': 'sobre.md',
        'about.title': 'Sobre mim',
        'about.comment': '// quem sou e o que construo',
        'about.file': 'perfil.ts',

        'projects.tab': 'projetos.ts',
        'projects.title': 'Projetos',
        'projects.comment': '// o que já coloquei no ar',
        'projects.path': '~/projetos/',
        'projects.featured': 'destaque',
        'projects.more': 'ler mais →',
        'projects.live': 'ver no ar',
        'projects.code': 'código',
        'projects.ready': 'pronto',
        'projects.imgAlt': 'Tela do projeto',
        'projects.goTo': 'Ir para o projeto',
        'projects.details': 'Detalhes do projeto',
        'projects.close': 'Fechar',

        'stack.tab': 'stack.json',
        'stack.title': 'Stack',
        'stack.comment': '// linguagens, ferramentas e o que uso no dia a dia',
        'stack.soft': '// soft skills:',
        'stack.cat.Linguagens': 'linguagens',
        'stack.cat.Web': 'web',
        'stack.cat.IA': 'ia',
        'stack.cat.Ferramentas': 'ferramentas',

        'exp.tab': 'experiencia.log',
        'exp.title': 'Experiência',
        'exp.comment': '// $ git log --carreira',
        'exp.current': '(HEAD → atual)',

        'edu.tab': 'formacao.md',
        'edu.title': 'Formação & cursos',
        'edu.comment': '// base acadêmica e certificações',
        'edu.courses': '~/certificados $ ls -l',

        'gh.tab': 'github.sh',
        'gh.title': 'GitHub',
        'gh.comment': '// dados ao vivo da API do GitHub',
        'gh.loading': 'Carregando repositórios...',
        'gh.noUser': 'Usuário do GitHub não configurado.',
        'gh.empty': 'Nenhum repositório público encontrado.',
        'gh.error': 'Não foi possível carregar os repositórios agora.',
        'gh.seeOnGithub': 'Ver no GitHub',
        'gh.repos': 'repositórios',
        'gh.languages': 'linguagens',
        'gh.stars': 'estrelas',
        'gh.mainLang': 'linguagem principal',
        'gh.profile': 'ver perfil',
        'gh.noDescription': 'Sem descrição.',
        'gh.others': 'outras',
        'gh.langAria': 'Linguagens no código dos repositórios',
        'gh.contribTitle': 'contribuições no último ano',
        'gh.contribTotal': '{n} contribuições no último ano',
        'gh.contribAria': '{n} contribuições no GitHub no último ano',
        'gh.contribDay1': '{n} contribuição em {date}',
        'gh.contribDayN': '{n} contribuições em {date}',
        'gh.contribGrid': 'Gráfico de contribuições no GitHub',
        'gh.less': 'menos',
        'gh.more': 'mais',

        'contact.tab': 'contato.sh',
        'contact.title': 'Contato',
        'contact.comment': '// vamos construir algo juntos',
        'contact.window': 'nathan@dev: ~/contato',
        'contact.cv': 'currículo em português.pdf',
        'contact.cvOther': 'currículo em inglês.pdf',

        'form.window': '~/contato $ ./nova-mensagem.sh',
        'form.name': 'nome',
        'form.email': 'email',
        'form.message': 'mensagem',
        'form.namePh': 'seu nome',
        'form.emailPh': 'voce@empresa.com',
        'form.messagePh': 'Olá, Nathan! ...',
        'form.send': 'enviar mensagem',
        'form.sending': 'enviando...',
        'form.sent': '✓ mensagem enviada! respondo em breve.',
        'form.error': '✗ não foi possível enviar agora. tente pelo e-mail ao lado.',

        'footer.built': 'feito com HTML, CSS & JavaScript puros',
        'footer.source': 'ver código'
    },

    en: {
        'skip': 'Skip to content',
        'nav.label': 'Main navigation',
        'nav.home': 'Home',
        'nav.open': 'Open menu',
        'nav.close': 'Close menu',
        'nav.path': '~/navigation',
        'nav.about': 'about',
        'nav.projects': 'projects',
        'nav.stack': 'stack',
        'nav.experience': 'experience',
        'nav.education': 'education',
        'nav.github': 'github',
        'nav.contact': 'contact',
        'lang.switch': 'Mudar para português',
        'theme.toLight': 'Switch to light theme',
        'theme.toDark': 'Switch to dark theme',

        'hero.roleCmd': 'cat role.txt',
        'hero.cv': 'Download resume',
        'hero.photoTitle': '~/photos/nathan.png',

        'term.hint': '# type help to see the commands',
        'term.inputLabel': 'Type a terminal command',
        'term.help.title': 'available commands:',
        'term.help.section': '<section>',
        'term.help.whoami': 'who I am',
        'term.help.ls': 'list the sections',
        'term.help.cv': 'download my resume (PDF)',
        'term.help.lang': 'see the site in Portuguese',
        'term.help.theme': 'toggle light/dark theme',
        'term.help.clear': 'clear the terminal',
        'term.ls': 'about/  projects/  stack/  experience/  education/  github/  contact/',
        'term.goto': 'opening {section}/ ...',
        'term.cv': 'downloading resume in English.pdf ...',
        'term.langUsage': 'usage: lang pt | lang en',
        'term.langSame': 'the site is already in English',
        'term.langTo.en': 'switching to English...',
        'term.langTo.pt': 'mudando para português...',
        'term.themeUsage': 'usage: theme light | theme dark',
        'term.themeSet': 'theme: {theme}',
        'term.notFound': 'command not found: {cmd}. type help',
        'term.sudo': 'nathan is not in the sudoers file. This incident will be reported. 😉',
        'hero.photoAlt': 'Photo of Nathan Domingues',

        'about.tab': 'about.md',
        'about.title': 'About me',
        'about.comment': '// who I am and what I build',
        'about.file': 'profile.ts',

        'projects.tab': 'projects.ts',
        'projects.title': 'Projects',
        'projects.comment': '// things I have shipped',
        'projects.path': '~/projects/',
        'projects.featured': 'featured',
        'projects.more': 'read more →',
        'projects.live': 'live demo',
        'projects.code': 'code',
        'projects.ready': 'ready',
        'projects.imgAlt': 'Screenshot of',
        'projects.goTo': 'Go to project',
        'projects.details': 'Project details',
        'projects.close': 'Close',

        'stack.tab': 'stack.json',
        'stack.title': 'Stack',
        'stack.comment': '// languages, tools and what I use day to day',
        'stack.soft': '// soft skills:',
        'stack.cat.Linguagens': 'languages',
        'stack.cat.Web': 'web',
        'stack.cat.IA': 'ai',
        'stack.cat.Ferramentas': 'tools',

        'exp.tab': 'experience.log',
        'exp.title': 'Experience',
        'exp.comment': '// $ git log --career',
        'exp.current': '(HEAD → current)',

        'edu.tab': 'education.md',
        'edu.title': 'Education & courses',
        'edu.comment': '// academic background and certificates',
        'edu.courses': '~/certificates $ ls -l',

        'gh.tab': 'github.sh',
        'gh.title': 'GitHub',
        'gh.comment': '// live data from the GitHub API',
        'gh.loading': 'Loading repositories...',
        'gh.noUser': 'GitHub username not configured.',
        'gh.empty': 'No public repositories found.',
        'gh.error': 'Could not load the repositories right now.',
        'gh.seeOnGithub': 'See on GitHub',
        'gh.repos': 'repositories',
        'gh.languages': 'languages',
        'gh.stars': 'stars',
        'gh.mainLang': 'main language',
        'gh.profile': 'view profile',
        'gh.noDescription': 'No description.',
        'gh.others': 'other',
        'gh.langAria': 'Languages in the repositories code',
        'gh.contribTitle': 'contributions in the last year',
        'gh.contribTotal': '{n} contributions in the last year',
        'gh.contribAria': '{n} GitHub contributions in the last year',
        'gh.contribDay1': '{n} contribution on {date}',
        'gh.contribDayN': '{n} contributions on {date}',
        'gh.contribGrid': 'GitHub contributions chart',
        'gh.less': 'less',
        'gh.more': 'more',

        'contact.tab': 'contact.sh',
        'contact.title': 'Contact',
        'contact.comment': "// let's build something together",
        'contact.window': 'nathan@dev: ~/contact',
        'contact.cv': 'resume in English.pdf',
        'contact.cvOther': 'resume in Portuguese.pdf',

        'form.window': '~/contact $ ./new-message.sh',
        'form.name': 'name',
        'form.email': 'email',
        'form.message': 'message',
        'form.namePh': 'your name',
        'form.emailPh': 'you@company.com',
        'form.messagePh': 'Hi Nathan! ...',
        'form.send': 'send message',
        'form.sending': 'sending...',
        'form.sent': "✓ message sent! I'll get back to you soon.",
        'form.error': '✗ could not send right now. please use the email beside.',

        'footer.built': 'built with plain HTML, CSS & JavaScript',
        'footer.source': 'view source'
    }
};

const I18N_LANGS = ['pt', 'en'];
const I18N_CONTENT = { pt: 'content/cv.json', en: 'content/cv.en.json' };
const I18N_LOCALE = { pt: 'pt-BR', en: 'en-US' };

function detectLanguage() {
    try {
        const fromUrl = new URLSearchParams(window.location.search).get('lang');
        if (I18N_LANGS.includes(fromUrl)) return fromUrl;
    } catch (e) { /* URL sem suporte */ }
    try {
        const saved = localStorage.getItem('lang');
        if (I18N_LANGS.includes(saved)) return saved;
    } catch (e) { /* armazenamento indisponível */ }
    const browser = (navigator.language || 'pt').toLowerCase();
    return browser.startsWith('pt') ? 'pt' : 'en';
}

let currentLang = detectLanguage();

// t('gh.contribTotal', { n: 10 }) -> "10 contribuições no último ano"
function t(key, vars) {
    const table = I18N_STRINGS[currentLang] || I18N_STRINGS.pt;
    let text = table[key] !== undefined ? table[key] : (I18N_STRINGS.pt[key] !== undefined ? I18N_STRINGS.pt[key] : key);
    if (vars) Object.entries(vars).forEach(([k, v]) => { text = text.split(`{${k}}`).join(String(v)); });
    return text;
}

function getLocale() {
    return I18N_LOCALE[currentLang] || 'pt-BR';
}

const SITE_URL = 'https://curriculonathdomin.netlify.app/';

// canonical e Open Graph apontam para a versão do idioma atual
function updateLanguageMeta() {
    const isEn = currentLang === 'en';
    const url = isEn ? `${SITE_URL}?lang=en` : SITE_URL;
    const set = (id, attr, value) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute(attr, value);
    };
    set('link-canonical', 'href', url);
    set('meta-og-url', 'content', url);
    set('meta-og-locale', 'content', isEn ? 'en_US' : 'pt_BR');
    set('meta-og-locale-alt', 'content', isEn ? 'pt_BR' : 'en_US');
}

function applyStaticStrings() {
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'pt-BR';
    updateLanguageMeta();

    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });

    // data-i18n-attr="aria-label:nav.open; title:nav.open"
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        el.dataset.i18nAttr.split(';').forEach(pair => {
            const [attr, key] = pair.split(':').map(s => s && s.trim());
            if (attr && key) el.setAttribute(attr, t(key));
        });
    });

    const langButton = document.getElementById('lang-button');
    if (langButton) {
        langButton.setAttribute('aria-label', t('lang.switch'));
        langButton.querySelectorAll('[data-lang]').forEach(span => {
            span.classList.toggle('is-active', span.dataset.lang === currentLang);
        });
    }
}

function setLanguage(lang) {
    if (!I18N_LANGS.includes(lang) || lang === currentLang) return;
    currentLang = lang;

    try { localStorage.setItem('lang', lang); } catch (e) { /* armazenamento indisponível */ }

    // Mantém a URL compartilhável (?lang=en) sem recarregar a página
    try {
        const url = new URL(window.location.href);
        if (lang === 'pt') url.searchParams.delete('lang');
        else url.searchParams.set('lang', lang);
        history.replaceState(null, '', url);
    } catch (e) { /* history sem suporte */ }

    applyStaticStrings();
    document.dispatchEvent(new CustomEvent('lang:change', { detail: { lang } }));
}

// Aplica já, antes do primeiro desenho da página (o script fica no fim do <body>)
applyStaticStrings();

document.addEventListener('DOMContentLoaded', () => {
    const langButton = document.getElementById('lang-button');
    if (langButton) {
        langButton.addEventListener('click', () => setLanguage(currentLang === 'pt' ? 'en' : 'pt'));
    }
});
