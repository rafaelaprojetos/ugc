import { Secao } from '@/components/ui/Secao'
import { SlotVideo } from '@/components/ui/SlotVideo'
import { useIdioma } from '@/hooks/useIdioma'

/**
 * Colagem espalhada: cada vídeo numa altura, num tamanho e num giro diferente,
 * sobrepondo o vizinho. Passar o mouse levanta e aumenta o vídeo.
 * Antes de 1024px nada disso existe — vira carrossel com swipe.
 */
const arranjo = [
  { classe: 'lg:w-[17%] lg:mt-32 lg:z-10', giro: -5 },
  { classe: 'lg:w-[19%] lg:mt-10 lg:z-20 lg:-ml-6', giro: 3 },
  { classe: 'lg:w-[25%] lg:mt-2 lg:z-30 lg:-ml-6', giro: -2 },
  { classe: 'lg:w-[19%] lg:mt-20 lg:z-20 lg:-ml-6', giro: 4 },
  { classe: 'lg:w-[17%] lg:mt-0 lg:z-10 lg:-ml-6', giro: -4 },
] as const

export function Virais() {
  const { c } = useIdioma()
  const videos = c.secoes.virais.videos

  return (
    <Secao id="virais">
      <div className="relative">
        <ul className="carrossel -mx-[var(--gutter)] gap-4 px-[var(--gutter)] pt-6 pb-4 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:flex lg:items-start lg:justify-center lg:gap-0 lg:pt-6 lg:pb-16">
          {videos.map((video, i) => (
            <li
              key={video.views}
              className={`carrossel-item w-[70vw] max-w-[300px] transition-transform duration-300 md:w-auto md:max-w-none lg:hover:z-50 lg:hover:scale-110 ${arranjo[i].classe}`}
              style={{ ['--giro' as string]: `${arranjo[i].giro}deg` }}
            >
              <div
                className="transition-transform duration-300 lg:[transform:rotate(var(--giro))]"
              >
                <SlotVideo id={`virais-video-${i + 1}`} etiqueta={video.views} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Secao>
  )
}
