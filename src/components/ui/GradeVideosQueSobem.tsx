import { SlotVideo } from '@/components/ui/SlotVideo'
import { useEntrouNaTela } from '@/hooks/useEntrouNaTela'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'

type Props = {
  /** prefixo do slot, ex: "tech" → tech-video-1, tech-video-2... */
  prefixo: string
  quantos: number
  colunas?: 2 | 4
}

/**
 * Grade de vídeos que entram subindo um sobre o outro quando a seção aparece,
 * em sequência rápida. Passar o mouse levanta o vídeo.
 */
export function GradeVideosQueSobem({ prefixo, quantos, colunas = 4 }: Props) {
  const { ref, entrou } = useEntrouNaTela<HTMLUListElement>(0.12)
  const menosMovimento = usePrefereMenosMovimento()
  const visivel = entrou || menosMovimento

  return (
    <ul
      ref={ref}
      className={`grid grid-cols-2 gap-3 md:gap-4 lg:gap-5 ${colunas === 4 ? 'md:grid-cols-4' : 'md:grid-cols-2'}`}
    >
      {Array.from({ length: quantos }, (_, i) => (
        <li
          key={i}
          style={{ transitionDelay: visivel ? `${i * 70}ms` : '0ms' }}
          className={`transition-all duration-500 ease-out lg:hover:z-20 lg:hover:-translate-y-3 ${
            visivel ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
          }`}
        >
          <SlotVideo id={`${prefixo}-video-${i + 1}`} />
        </li>
      ))}
    </ul>
  )
}
