import { useEffect, useRef, useState } from 'react'

/**
 * Avisa quando o elemento aparece na tela pela primeira vez.
 * Serve para disparar animações de entrada e o contador.
 *
 * Confere a posição na hora de montar antes de ligar o observador: se a seção
 * já está visível (link direto, tela grande, página curta), o conteúdo aparece
 * sem depender de rolagem. Texto não pode ficar preso atrás de animação.
 */
export function useEntrouNaTela<T extends HTMLElement>(limiar = 0.25) {
  const ref = useRef<T>(null)
  const [entrou, setEntrou] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || entrou) return

    const jaEstaNaTela = () => {
      const r = el.getBoundingClientRect()
      if (r.height === 0) return false
      const visivel = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0)
      return visivel > 0 && visivel / r.height >= Math.min(limiar, 0.5)
    }

    if (jaEstaNaTela()) {
      // fora do fluxo do efeito, para não encadear render
      queueMicrotask(() => setEntrou(true))
      return
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setEntrou(true)
          observador.disconnect()
        }
      },
      { threshold: limiar },
    )

    observador.observe(el)
    return () => observador.disconnect()
  }, [entrou, limiar])

  return { ref, entrou }
}
