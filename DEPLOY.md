# Publicar o site no GitHub Pages

Do zero até rafaelacreator.com no ar com HTTPS.

---

## 1. Criar o repositório no GitHub

1. Entre em **github.com** → botão **+** no canto superior direito → **New repository**
2. Repository name: `portfolio`
3. Deixe **Public** (o GitHub Pages de graça só funciona em repositório público)
4. **NÃO** marque "Add a README" nem nada nessa tela — o projeto já tem tudo
5. **Create repository**

A página seguinte mostra uns comandos. Ignore, use os daqui de baixo.

---

## Atalho: um arquivo só, para ver o site no ar hoje

```bash
npm run arquivo-unico
```

Gera `portfolio-index.html` na pasta do projeto: 701 kB com **tudo dentro** —
estilos, JavaScript, fontes e cursor viram texto no próprio arquivo. Zero
dependência externa.

No GitHub: **Add file → Upload files**, arraste ele, e **renomeie para
`index.html`**. Em Settings → Pages, Source = **Deploy from a branch**, `main`,
`/ (root)`.

O que você perde nesse atalho:

- os endereços `/pt` e `/en` não existem (o seletor de idioma funciona, mas sem
  mudar a URL)
- **vídeo e foto não cabem dentro de um arquivo.** Enquanto os slots estiverem
  vazios tudo bem; quando as mídias entrarem, tem que ser a pasta inteira

Serve para ver o site funcionando agora. Para valer, use o caminho de baixo.

## 2. Mandar o código

**Não dá para subir só o `index.html`.** Ele sozinho não é o site — é o esqueleto
que chama todo o resto. Subindo só ele, a página fica branca. Tem que ir a pasta
inteira.

### Jeito mais fácil: GitHub Desktop

1. Baixe em **desktop.github.com** e instale
2. Abra e entre com sua conta do GitHub (abre no navegador, sem digitar token)
3. **File → Add Local Repository** → escolha `Documentos/portfolio`
4. Ele mostra os commits prontos. Clique em **Publish repository**
   - desmarque **Keep this code private** (o Pages de graça precisa ser público)
5. Daí em diante: mudou algo? O Desktop mostra. Escreve uma frase, **Commit**,
   depois **Push origin**. O site se atualiza sozinho em dois minutos.

Se o repositório `portfolio` já existe na sua conta e está com arquivos soltos,
apague ele antes (Settings → lá embaixo → Delete this repository) e deixe o
Desktop criar do zero.

### Jeito do terminal

```bash
cd ~/Documents/portfolio
git remote add origin https://github.com/SEU-USUARIO/portfolio.git
git push -u origin main
```

O Git vai pedir usuário e senha. A "senha" não é a sua senha do GitHub: é um
token. github.com → foto do perfil → Settings → Developer settings →
Personal access tokens → Tokens (classic) → Generate new token →
marque **repo** e **workflow** → copie e use como senha.

---

## 3. Ligar o GitHub Pages

No repositório: **Settings** → **Pages** (menu da esquerda)

- Em **Source**, escolha **GitHub Actions** (não "Deploy from a branch")

Pronto. O arquivo `.github/workflows/publicar.yml` já está no projeto: a cada
`git push` ele constrói o site e publica sozinho. Acompanhe na aba **Actions**.

---

## 4. Cadastrar a chave do formulário

Sem isso o formulário de orçamento mostra "ainda não foi configurado".

**Primeiro, criar a chave:**

1. Abra **web3forms.com**
2. Em "Email Address" escreva **rafaelachagas@seuinfluencer.com.br** — é para esse
   endereço que os pedidos vão chegar
3. **Create Access Key** e confirme pelo e-mail que chegar
4. Copie a chave

**Depois, cadastrar no GitHub:**

Repositório → **Settings** → **Secrets and variables** → **Actions** →
**New repository secret**

| Name | Secret |
| --- | --- |
| `VITE_WEB3FORMS_KEY` | a chave que você copiou |

Depois vá em **Actions** → último workflow → **Re-run all jobs**, para o site ser
reconstruído com a chave.

> Para testar no seu computador, a chave vai no arquivo `.env` (veja `.env.example`).
> Esse arquivo nunca vai para o GitHub — é proposital.

---

## 5. Apontar rafaelacreator.com

### No GitHub

Settings → Pages → **Custom domain** → escreva `rafaelacreator.com` → **Save**

(O arquivo `CNAME` já é gerado automaticamente a cada build, então esse campo
costuma se preencher sozinho.)

### No painel onde você comprou o domínio

(Registro.br, GoDaddy, Hostinger — muda o nome, a ideia é a mesma: procure **DNS**
ou "Zona DNS")

Apague registros A e CNAME antigos de `@` e `www`, e crie estes:

| Tipo | Nome | Valor |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `SEU-USUARIO.github.io` |

São quatro registros A mesmo — é assim que o GitHub distribui.

Leva de alguns minutos a algumas horas. Quando terminar, volte em Settings → Pages
e marque **Enforce HTTPS**. O certificado é emitido pelo GitHub, de graça.

O `www` passa a redirecionar para o domínio sem www sozinho.

---

## 6. Conferir depois que estiver no ar

| O quê | Onde | Esperado |
| --- | --- | --- |
| Site abre | `rafaelacreator.com` | vai para `/pt` |
| Inglês | `rafaelacreator.com/en` | abre em inglês |
| www | `www.rafaelacreator.com` | redireciona |
| HTTPS | `http://rafaelacreator.com` | vira `https://` |
| Performance | PageSpeed Insights, aba Mobile | acima de 90 |
| Formulário | mandar um teste | chega em rafaelachagas@seuinfluencer.com.br |

---

## O que o GitHub Pages não faz

O Pages serve arquivo e **não deixa configurar headers HTTP**. Então estes três
não existem lá, por mais que estejam no `vercel.json`:

- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options` (impede seu site dentro de um iframe alheio)
- `X-Content-Type-Options`

A CSP continua valendo — está numa meta tag dentro do `index.html`. No
securityheaders.com isso costuma dar nota **C ou B** em vez de A, e não tem jeito
no Pages. Se a nota A importar, a Vercel resolve: é importar o mesmo repositório
lá e os headers do `vercel.json` passam a valer. O projeto funciona nos dois.

---

## Mudou alguma coisa no site?

```bash
git add -A
git commit -m "o que você mudou"
git push
```

Em um ou dois minutos o site está atualizado. Acompanhe na aba **Actions**.
