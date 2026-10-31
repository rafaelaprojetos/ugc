import { useEffect, useState } from 'react'
import { useIdioma } from '@/hooks/useIdioma'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'

const DURACAO = 1200

/** Suaviza a contagem: rápido no começo, desacelerando no fim. */
const suavizar = (p: number) => 1 - (1 - p) ** 3

type Props = {
  /** valor final, ex: 3 */
  ate: number
  /** o que vem depois do número, ex: " milhões" */
  sufixo?: string
  /** dispara a contagem quando vira true */
  ativo: boolean
}

/**
 * Conta de 0 até o valor final quando a seção entra na tela.
 * Com prefers-reduced-motion, mostra o número final direto.
 */
export function ContadorAnimado({ ate, sufixo = '', ativo }: Props) {
  const { idioma } = useIdioma()
  const menosMovimento = usePrefereMenosMovimento()
  const [valor, setValor] = useState(0)

  useEffect(() => {
    // Em prefers-reduced-motion não há contagem: o valor sai pronto no render.
    if (!ativo || menosMovimento) return

    let quadro = 0
    const inicio = performance.now()

    const passo = (agora: number) => {
      const progresso = Math.min(1, (agora - inicio) / DURACAO)
      setValor(Math.round(ate * suavizar(progresso)))
      if (progresso < 1) quadro = requestAnimationFrame(passo)
    }

    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [ativo, ate, menosMovimento])

  const mostrado = menosMovimento && ativo ? ate : valor
  const formatado = mostrado.toLocaleString(idioma === 'pt' ? 'pt-BR' : 'en-US')

  return (
    <span className="palavra-contorno font-display text-lilas">
      {formatado}
      {sufixo}
    </span>
  )
}
