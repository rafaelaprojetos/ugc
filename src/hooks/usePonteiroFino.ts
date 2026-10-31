import { useSyncExternalStore } from 'react'

const CONSULTA = '(hover: hover) and (pointer: fine)'

function subscrever(aoMudar: () => void) {
  const mq = window.matchMedia(CONSULTA)
  mq.addEventListener('change', aoMudar)
  return () => mq.removeEventListener('change', aoMudar)
}

const ler = () => window.matchMedia(CONSULTA).matches

/**
 * true quando existe mouse de verdade.
 * Hover só vale no desktop — no celular e no tablet tudo é toque.
 */
export function usePonteiroFino(): boolean {
  return useSyncExternalStore(subscrever, ler, () => false)
}
