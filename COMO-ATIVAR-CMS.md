# Como ativar o painel de edição (Decap CMS)

O site já está pronto para o CMS. Faltam só 3 passos de configuração **dentro do painel do Netlify** (uma única vez).

## O que foi adicionado ao projeto

- `content/cv.json` → arquivo com todo o conteúdo do currículo (o CMS edita este arquivo).
- `admin/index.html` e `admin/config.yml` → o painel de edição em si, acessível em `seusite.netlify.app/admin`.
- `js/render.js` → novo script que lê `content/cv.json` e insere o conteúdo no site.
- `index.html` e `js/script.js` → ajustados para carregar o conteúdo dinamicamente e receber o login do painel.

## Passo 1 — Publicar o site no Netlify

Se ainda não publicou:
1. Suba esta pasta para um repositório no GitHub (ou GitLab/Bitbucket).
2. No painel do Netlify: **Add new site → Import an existing project** e conecte o repositório.
3. Deploy padrão (não precisa de comando de build; é site estático).

## Passo 2 — Ativar Identity

1. No painel do site no Netlify: **Site configuration → Identity → Enable Identity**.
2. Em **Registration**, deixe como **Invite only** (assim só você consegue acessar o `/admin`).

## Passo 3 — Ativar Git Gateway

1. Ainda em Identity, vá em **Services → Git Gateway → Enable Git Gateway**.
   (Isso permite que o painel salve as alterações direto no seu repositório Git.)

## Passo 4 — Convidar você mesmo como usuário

1. Em **Identity → Invite users**, adicione seu próprio e-mail.
2. Você receberá um convite por e-mail para definir uma senha.

## Pronto — usando o painel

Acesse `https://seusite.netlify.app/admin`, faça login com o e-mail/senha e edite:

- Textos do topo (hero), foto de perfil
- Texto "Sobre mim" e as 3 caixinhas de destaque
- Experiências profissionais (adicionar, remover, reordenar)
- Formação acadêmica
- Habilidades comportamentais e técnicas
- Cursos extras
- Email, LinkedIn, WhatsApp e o PDF do currículo para download

Cada alteração salva vira um commit automático no seu repositório Git, e o Netlify republica o site sozinho.

## Observação

Se preferir hospedar em outro lugar (GitHub Pages, Vercel etc.) no futuro, é só trocar o `backend` em `admin/config.yml` para usar OAuth do GitHub em vez de `git-gateway` — me avise que ajusto essa parte.
