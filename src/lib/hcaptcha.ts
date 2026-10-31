import { useCallback, useRef } from 'react'

declare global {
  interface Window {
    hcaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      execute: (id: string, opts: { async: true }) => Promise<{ response: string }>
      reset: (id: string) => void
    }
  }
}

let carregando: Promise<void> | null = null

/** Carrega o script do hCaptcha só quando o formulário vai ser enviado. */
function carregarScript(): Promise<void> {
  if (window.hcaptcha) return Promise.resolve()
  if (carregando) return carregando

  carregando = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      carregando = null
      reject(new Error('hCaptcha não carregou'))
    }
    document.head.appendChild(script)
  })

  return carregando
}

/**
 * hCaptcha invisível: nada aparece na tela e nada é pedido à pessoa.
 * Sem VITE_HCAPTCHA_SITEKEY configurada, devolve null e o formulário
 * segue protegido só pelo honeypot.
 */
export function useHCaptchaInvisivel(sitekey: string) {
  const caixa = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)

  const executar = useCallback(async (): Promise<string | null> => {
    if (!sitekey || !caixa.current) return null

    await carregarScript()
    const h = window.hcaptcha
    if (!h) return null

    if (widget.current === null) {
      widget.current = h.render(caixa.current, { sitekey, size: 'invisible' })
    } else {
      h.reset(widget.current)
    }

    const resultado = await h.execute(widget.current, { async: true })
    return resultado?.response ?? null
  }, [sitekey])

  return { caixa, executar }
}
