import { useSyncExternalStore } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

function subscrever(aoMudar: () => void) {
  const mq = window.matchMedia(CONSULTA)
  mq.addEventListener('change', aoMudar)
  return () => mq.removeEventListener('change', aoMudar)
}

const ler = () => window.matchMedia(CONSULTA).matches

/**
 * Regra 6: respeita prefers-reduced-motion.
 * Retorna true quando a pessoa pediu menos animação — aí desligamos loops.
 */
export function usePrefereMenosMovimento(): boolean {
  return useSyncExternalStore(subscrever, ler, () => false)
}
