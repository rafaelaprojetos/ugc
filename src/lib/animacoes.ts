import type { Variants } from 'framer-motion'

/**
 * Entrada da capa: os elementos caem na tela em sequência rápida,
 * como se alguém tivesse soltado tudo em cima da mesa.
 */
export const conjuntoSolto: Variants = {
  oculto: {},
  visivel: {
    transition: { staggerChildren: 0.055, delayChildren: 0.1 },
  },
}

export const pecaSolta: Variants = {
  oculto: { opacity: 0, y: -22, scale: 0.9 },
  visivel: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 380, damping: 24 },
  },
}
