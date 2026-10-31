import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useIdioma } from '@/hooks/useIdioma'
import { useHCaptchaInvisivel } from '@/lib/hcaptcha'

const CHAVE_WEB3FORMS = import.meta.env.VITE_WEB3FORMS_KEY ?? ''
const SITEKEY_HCAPTCHA = import.meta.env.VITE_HCAPTCHA_SITEKEY ?? ''

/** Intervalo mínimo entre dois envios, em milissegundos. */
const INTERVALO_MINIMO = 30_000
const LIMITE_EMAIL = 120
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Estado = 'parado' | 'enviando' | 'enviado' | 'erro'

/**
 * Guardamos a CHAVE do recado, não o texto pronto: se a pessoa trocar de
 * idioma com uma mensagem na tela, ela precisa trocar de idioma junto.
 */
type Recado = 'sucesso' | 'erroEnvio' | 'erroEmail' | 'erroIntervalo' | 'erroConfig'

/**
 * Pedido de orçamento: um campo só, o e-mail.
 * O envio vai direto para a caixa de entrada via Web3Forms —
 * nada é salvo no navegador nem em banco de dados.
 */
export function FormularioOrcamento() {
  const { c, idioma } = useIdioma()
  const t = c.formulario
  const [estado, setEstado] = useState<Estado>('parado')
  const [recado, setRecado] = useState<Recado | null>(null)
  const ultimoEnvio = useRef(0)
  const { caixa, executar } = useHCaptchaInvisivel(SITEKEY_HCAPTCHA)

  const travado = estado === 'enviando' || estado === 'enviado'

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (travado) return

    const form = evento.currentTarget
    const dados = new FormData(form)

    // Honeypot: só robô preenche esse campo
    if (String(dados.get('website') ?? '').trim() !== '') {
      setEstado('enviado')
      setRecado('sucesso')
      return
    }

    const email = String(dados.get('email') ?? '').trim()

    if (!email || email.length > LIMITE_EMAIL || !REGEX_EMAIL.test(email)) {
      setEstado('erro')
      setRecado('erroEmail')
      return
    }
    if (Date.now() - ultimoEnvio.current < INTERVALO_MINIMO) {
      setEstado('erro')
      setRecado('erroIntervalo')
      return
    }
    if (!CHAVE_WEB3FORMS) {
      setEstado('erro')
      setRecado('erroConfig')
      return
    }

    setEstado('enviando')
    setRecado(null)

    try {
      const token = await executar()

      const resposta = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CHAVE_WEB3FORMS,
          subject: `Pedido de orçamento (${idioma.toUpperCase()}) — rafaelacreator.com`,
          from_name: 'rafaelacreator.com',
          email,
          // para você saber em que língua responder
          idioma: idioma === 'pt' ? 'Português' : 'English',
          botcheck: false,
          ...(token ? { 'h-captcha-response': token } : {}),
        }),
      })

      const resultado = (await resposta.json()) as { success?: boolean }
      if (!resposta.ok || !resultado.success) throw new Error('falha no envio')

      ultimoEnvio.current = Date.now()
      setEstado('enviado')
      setRecado('sucesso')
      form.reset()
    } catch {
      setEstado('erro')
      setRecado('erroEnvio')
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-3">
      {/* Honeypot — fora da tela, invisível para quem usa o site */}
      <div aria-hidden="true" className="apenas-leitor">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="orc-email" className="mb-1 block text-sm font-semibold text-tinta">
          {t.email.label}
        </label>
        <input
          id="orc-email"
          name="email"
          type="email"
          required
          maxLength={LIMITE_EMAIL}
          inputMode="email"
          autoComplete="email"
          placeholder={t.email.placeholder}
          disabled={travado}
          className="min-h-11 w-full rounded-janela border-2 border-tinta bg-branco px-3 py-2 text-base text-tinta placeholder:text-tinta/40 focus:outline-none"
        />
      </div>

      {/* hCaptcha invisível — nada aparece aqui */}
      <div ref={caixa} />

      <button
        type="submit"
        disabled={travado}
        className="alvo-toque w-full rounded-pill border-2 border-tinta bg-lima px-6 py-3 font-display text-lg lowercase text-tinta shadow-colagem transition-colors hover:bg-lilas disabled:opacity-55"
      >
        {estado === 'enviando' ? t.enviando : t.enviar}
      </button>

      <p className="text-xs text-tinta/60">{t.lgpd}</p>

      <p
        role="status"
        aria-live="polite"
        className="min-h-5 text-sm font-semibold text-tinta"
      >
        {recado ? t[recado] : ''}
      </p>
    </form>
  )
}
