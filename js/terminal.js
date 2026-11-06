/* =======================================================================
   TERMINAL INTERATIVO DO TOPO
   Depois da animação de digitação (evento "terminal:ready", disparado por
   js/script.js), a última linha do terminal vira um campo onde o visitante
   digita comandos: help, projetos, lang en, theme light, cv, clear...
   Textos em js/i18n.js (chaves "term.*").
   ======================================================================= */

(() => {
    const MAX_LINES = 24;

    // Seções do site: id no HTML -> nomes aceitos como comando ([português, inglês])
    const SECTIONS = [
        { id: 'sobre', names: ['sobre', 'about'] },
        { id: 'projetos', names: ['projetos', 'projects'] },
        { id: 'stack', names: ['stack', 'stack'] },
        { id: 'experiencia', names: ['experiencia', 'experience'] },
        { id: 'formacao', names: ['formacao', 'education'] },
        { id: 'github', names: ['github', 'github'] },
        { id: 'contato', names: ['contato', 'contact'] }
    ];

    const COMMANDS = {
        help: { aliases: ['ajuda', '?'], run: () => write(t('term.help')) },
        whoami: { run: whoami },
        ls: { aliases: ['dir'], run: () => write(t('term.ls')) },
        cd: { run: (args) => changeDirectory(args[0]) },
        cv: { aliases: ['resume', 'curriculo'], run: downloadCv },
        lang: { aliases: ['idioma'], run: changeLanguage },
        theme: { aliases: ['tema'], run: changeTheme },
        clear: { aliases: ['cls', 'limpar'], run: () => { output.innerHTML = ''; } },
        echo: { run: (args) => write(args.join(' ')) },
        sudo: { run: () => write(t('term.sudo')) }
    };

    let output = null;
    let input = null;
    const typed = [];
    let typedIndex = 0;

    document.addEventListener('terminal:ready', init);

    function init() {
        const body = document.getElementById('terminal-body');
        const last = body && body.querySelector('.t-last');
        if (!last || input) return;

        // A saída dos comandos fica entre o conteúdo original e a linha de digitação
        output = document.createElement('div');
        output.className = 't-history';
        output.setAttribute('aria-live', 'polite');
        last.before(output);
        addLine(escapeHtml(t('term.hint')), 't-comment');

        input = document.createElement('input');
        input.type = 'text';
        input.className = 't-input';
        input.autocomplete = 'off';
        input.autocapitalize = 'off';
        input.spellcheck = false;
        input.enterKeyHint = 'send';
        input.dataset.i18nAttr = 'aria-label:term.inputLabel';
        input.setAttribute('aria-label', t('term.inputLabel'));
        input.placeholder = ' '; // permite o CSS saber se o campo está vazio (:placeholder-shown)

        // O campo entra junto com o cursor piscando, que continua visível enquanto
        // o campo está vazio e sem foco (sinal de que dá para digitar)
        const field = document.createElement('span');
        field.className = 't-field';
        const cursor = last.querySelector('.cursor') || document.createElement('span');
        cursor.className = 'cursor';
        cursor.setAttribute('aria-hidden', 'true');
        field.append(input, cursor);
        last.append(field);
        last.classList.add('is-shown');

        input.addEventListener('keydown', onKey);
        // Clicar no terminal (sem estar selecionando texto) coloca o foco no campo
        body.addEventListener('click', () => {
            if (!String(window.getSelection())) input.focus({ preventScroll: true });
        });
    }

    function onKey(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = input.value.trim();
            input.value = '';
            run(value);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (!typed.length) return;
            e.preventDefault();
            typedIndex = Math.max(0, Math.min(typed.length, typedIndex + (e.key === 'ArrowUp' ? -1 : 1)));
            input.value = typed[typedIndex] || '';
        } else if (e.key === 'Tab' && input.value.trim()) {
            e.preventDefault();
            complete();
        }
    }

    function run(raw) {
        addLine(`<span class="t-prompt">~ $</span> <span class="t-cmd">${escapeHtml(raw)}</span>`, 't-line');
        if (!raw) return;

        typed.push(raw);
        typedIndex = typed.length;

        const [name, ...args] = raw.split(/\s+/);
        const key = normalize(name);

        const section = findSection(key);
        if (section) return goToSection(section);

        const command = Object.entries(COMMANDS)
            .find(([cmd, def]) => cmd === key || (def.aliases || []).includes(key));
        if (command) return command[1].run(args);

        write(t('term.notFound', { cmd: name }));
    }

    /* ---------------- Comandos ---------------- */

    function whoami() {
        const name = document.getElementById('hero-title')?.textContent.trim() || 'Nathan Domingues';
        const role = document.getElementById('hero-profession')?.textContent.trim();
        write(role ? `${name} · ${role}` : name);
    }

    // "cd projetos", "cd projects/", "cd ~"
    function changeDirectory(target) {
        const section = findSection(normalize(target || '').replace(/\/$/, ''));
        if (section) return goToSection(section);
        if (!target || target === '~') {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            return;
        }
        write(t('term.notFound', { cmd: `cd ${target}` }));
    }

    function goToSection(section) {
        write(t('term.goto', { section: sectionName(section) }));
        const target = document.getElementById(section.id);
        if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }

    function downloadCv() {
        const link = document.getElementById('cv-download-link');
        if (!link || !link.getAttribute('href')) return write(t('term.notFound', { cmd: 'cv' }));
        write(t('term.cv'));
        link.click();
    }

    function changeLanguage(args) {
        const lang = normalize(args[0] || '');
        if (!I18N_LANGS.includes(lang)) return write(t('term.langUsage'));
        if (lang === currentLang) return write(t('term.langSame'));
        write(t(`term.langTo.${lang}`));
        setLanguage(lang);
    }

    function changeTheme(args) {
        const names = { light: 'light', claro: 'light', dark: 'dark', escuro: 'dark' };
        const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const wanted = args[0] ? names[normalize(args[0])] : (current === 'light' ? 'dark' : 'light');
        if (!wanted) return write(t('term.themeUsage'));
        // O botão de tema já aplica e salva a escolha
        if (wanted !== current && themeButton) themeButton.click();
        write(t('term.themeSet', { theme: wanted }));
    }

    function complete() {
        const value = normalize(input.value);
        const names = [...Object.keys(COMMANDS), ...SECTIONS.map(sectionName)];
        const match = names.find(name => name.startsWith(value));
        if (match) input.value = match;
    }

    /* ---------------- Auxiliares ---------------- */

    function findSection(key) {
        return SECTIONS.find(s => s.names.includes(key));
    }

    function sectionName(section) {
        return section.names[currentLang === 'en' ? 1 : 0];
    }

    function write(text) {
        addLine(escapeHtml(text), 't-out');
    }

    function addLine(html, className) {
        const line = document.createElement('p');
        line.className = className;
        line.innerHTML = html;
        output.append(line);

        // Guarda só as últimas linhas para o terminal não crescer sem limite
        while (output.children.length > MAX_LINES) output.firstElementChild.remove();
    }

    // "Formação" / "FORMAÇÃO" -> "formacao"
    function normalize(text) {
        return stripAccents(text).toLowerCase().trim();
    }
})();
