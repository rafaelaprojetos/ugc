# Publicar o site

Passo a passo completo, do zero até rafaelacreator.com no ar com HTTPS.

---

## 1. Antes de tudo: preencher o que falta

| O quê | Onde | Status |
| --- | --- | --- |
| Chave do Web3Forms | `.env` → `VITE_WEB3FORMS_KEY` | **falta** |
| WhatsApp do sócio | `src/content/media.ts` → `links.whatsappSocio` | **falta** |
| Capa do link compartilhado | `public/assets/og/capa.webp` (1200x630) | **falta** |
| Mídias (78 slots) | `npm run midias` mostra cada uma | **falta** |

O site publica sem isso — só vai aparecer moldura listrada no lugar das mídias e
o formulário vai avisar que não está configurado. Dá para publicar e ir preenchendo.

### Criar a chave do Web3Forms

1. Abra **web3forms.com**
2. Em "Email Address", escreva **rafaelachagas@seuinfluencer.com.br**
   (é para esse endereço que os pedidos de orçamento vão chegar)
3. Clique em "Create Access Key"
4. Abra o e-mail que chegou e clique no link de confirmação
5. Copie a chave (parece `1a2b3c4d-5e6f-7890-abcd-ef1234567890`)
6. Cole no arquivo `.env`, depois de `VITE_WEB3FORMS_KEY=`

---

## 2. Colocar o código no GitHub

```bash
git init
git add .
git commit -m "Portfólio Rafaela Chagas"
```

Depois, em **github.com**: New repository → nome `portfolio` → **Private** →
Create. O GitHub mostra os dois comandos para colar no terminal (`git remote add`
e `git push`).

O `.env` **não vai** para o GitHub — já está no `.gitignore`. Isso é proposital.

---

## 3. Importar na Vercel

1. Entre em **vercel.com** com a conta do GitHub
2. **Add New → Project**
3. Escolha o repositório `portfolio` → **Import**
4. A Vercel reconhece o Vite sozinho. Não mexa em Build Command nem Output Directory.
5. Antes de clicar em Deploy, abra **Environment Variables** e adicione:

   | Name | Value |
   | --- | --- |
   | `VITE_WEB3FORMS_KEY` | a chave que você criou |
   | `VITE_HCAPTCHA_SITEKEY` | (deixe vazio por enquanto) |

6. **Deploy**. Em um ou dois minutos o site está no ar num endereço `.vercel.app`.

> Mudou alguma variável depois? Settings → Environment Variables → edite →
> depois **Deployments → ⋯ → Redeploy**. Variável de ambiente só entra no site
> em um build novo.

---

## 4. Apontar rafaelacreator.com

### Na Vercel

1. Settings → **Domains**
2. Digite `rafaelacreator.com` → Add
3. Digite `www.rafaelacreator.com` → Add
4. A Vercel mostra os registros de DNS que você precisa criar. **Use os valores que
   ela mostrar na sua tela** — hoje costumam ser estes, mas podem mudar:

   | Tipo | Nome | Valor |
   | --- | --- | --- |
   | A | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |

### No lugar onde você comprou o domínio

(Registro.br, GoDaddy, Hostinger, Namecheap — o painel muda de nome mas a ideia é a mesma)

1. Procure **DNS**, "Zona DNS" ou "Gerenciar DNS"
2. Apague registros A ou CNAME antigos de `@` e `www` que apontem para outro lugar
3. Crie os dois registros que a Vercel mostrou
4. Salve

A propagação leva de alguns minutos a algumas horas. Na Vercel, o domínio sai de
"Invalid Configuration" para **Valid Configuration** sozinho quando terminar.

### www e HTTPS

Já estão resolvidos, você não precisa fazer nada:

- **www → sem www**: o `vercel.json` tem um redirecionamento 308 permanente
- **HTTPS**: a Vercel emite o certificado sozinho e redireciona http → https
- **HSTS**: o `vercel.json` manda o navegador só usar https por 2 anos

---

## 5. Conferir depois que estiver no ar

| O quê | Onde | Esperado |
| --- | --- | --- |
| Headers de segurança | securityheaders.com → `https://rafaelacreator.com` | A ou A+ |
| Performance | PageSpeed Insights → aba Mobile | acima de 90 |
| www redireciona | abrir `www.rafaelacreator.com` | cai em `rafaelacreator.com` |
| http redireciona | abrir `http://rafaelacreator.com` | vira `https://` |
| Raiz detecta idioma | abrir `rafaelacreator.com` | vai para `/pt` |
| Formulário | mandar um teste pra si mesma | chega em rafaelachagas@seuinfluencer.com.br |

### Se o securityheaders.com não der A

Quase sempre é cache. Os seis headers estão configurados no `vercel.json`:
CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy e Permissions-Policy.

Se ele reclamar de **`unsafe-inline` em style-src**: isso é esperado e não derruba
a nota. O React e o Framer Motion escrevem estilo direto no elemento para animar;
tirar isso quebraria as animações do site.

Se ele reclamar de **header faltando**: provavelmente o deploy saiu sem o
`vercel.json`. Confira se o arquivo está no GitHub, na raiz do repositório.

---

## 6. Google

Depois que o domínio estiver funcionando:

1. **search.google.com/search-console** → adicionar propriedade `rafaelacreator.com`
2. Em Sitemaps, enviar: `sitemap.xml`

O `robots.txt` e o `sitemap.xml` já estão prontos com as duas rotas (`/pt` e `/en`)
e as tags hreflang.
