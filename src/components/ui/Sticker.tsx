import { PlaceholderMidia } from '@/components/ui/PlaceholderMidia'
import { slot as buscarSlot } from '@/content/media'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'
import { arquivoDoSlot } from '@/lib/midias'

type Props = {
  /** nome do slot, ex: "sticker-camera" */
  id: string
  /** rotação inicial em graus */
  giro?: number
  className?: string
}

/**
 * Sticker 3D decorativo com leve flutuação em loop.
 * Ocupa toda a largura de quem o envolve — quem posiciona é o pai.
 * Em prefers-reduced-motion a flutuação é desligada.
 */
export function Sticker({ id, giro = 0, className = '' }: Props) {
  const menosMovimento = usePrefereMenosMovimento()
  const info = buscarSlot(id)
  const arquivo = arquivoDoSlot(id)

  if (!info) return null

  const estilo = {
    ['--giro' as string]: `${giro}deg`,
    transform: `rotate(${giro}deg)`,
    animationDelay: `${(Math.abs(giro) % 7) * 0.35}s`,
  }
  const flutuacao = menosMovimento ? '' : 'flutua'

  if (!arquivo) {
    return (
      <span aria-hidden="true" style={estilo} className={`block w-full ${flutuacao} ${className}`}>
        <PlaceholderMidia slot={info} rotulo={info.id.replace('sticker-', '')} compacto />
      </span>
    )
  }

  return (
    <img
      src={arquivo.src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      style={estilo}
      className={`block w-full select-none ${flutuacao} ${className}`}
    />
  )
}
