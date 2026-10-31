import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Secao } from '@/components/ui/Secao'
import { SlotLogo } from '@/components/ui/SlotLogo'
import { marcas } from '@/content/media'
import { useIdioma } from '@/hooks/useIdioma'
import { usePonteiroFino } from '@/hooks/usePonteiroFino'
import { usePrefereMenosMovimento } from '@/hooks/useMovimento'

/**
 * Um tamanho e uma altura para cada bolinha — nenhuma repete a vizinha.
 * Vale em todas as larguras, não só no desktop: em grade todas saíam iguais
 * e a última ficava sozinha numa linha. Em flex solto a última linha centraliza.
 */
const variacoes = [
  'w-20 translate-y-0 md:w-24 lg:w-28 lg:translate-y-0',
  'w-14 translate-y-1 md:w-16 lg:w-20 lg:translate-y-6',
  'w-24 -translate-y-1 md:w-30 lg:w-32 lg:-translate-y-4',
  'w-16 translate-y-2 md:w-20 lg:w-24 lg:translate-y-3',
  'w-22 -translate-y-2 md:w-26 lg:w-28 lg:-translate-y-7',
  'w-18 translate-y-1 md:w-22 lg:w-24 lg:translate-y-4',
  'w-26 -translate-y-1 md:w-32 lg:w-36 lg:-translate-y-2',
  'w-16 translate-y-2 md:w-18 lg:w-20 lg:translate-y-8',
  'w-20 -translate-y-2 md:w-24 lg:w-28 lg:-translate-y-5',
  'w-14 translate-y-1 md:w-18 lg:w-22 lg:translate-y-1',
  'w-24 -translate-y-1 md:w-28 lg:w-32 lg:-translate-y-6',
  'w-18 translate-y-2 md:w-20 lg:w-24 lg:translate-y-5',
  'w-22 -translate-y-2 md:w-26 lg:w-30 lg:-translate-y-3',
] as const

/** Respiração de cada bolinha: ciclo entre 3s e 4s, com atrasos diferentes. */
function ritmo(i: number): CSSProperties {
  return {
    ['--duracao' as string]: `${3 + ((i * 7) % 11) / 10}s`,
    ['--atraso' as string]: `${((i * 13) % 19) / 10}s`,
  }
}

export function Marcas() {
  const { c } = useIdioma()
  const nomes: Record<string, string> = c.secoes.marcas.nomes
  const menosMovimento = usePrefereMenosMovimento()
  const podeHover = usePonteiroFino()
  const [emFoco, setEmFoco] = useState<string | null>(null)

  return (
    <Secao id="marcas" tamanho="grande">
      <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4 md:gap-x-5 md:gap-y-6 lg:gap-7">
        {marcas.map((marca, i) => {
          const id = `logo-${marca}`
          const destacada = emFoco === id
          // Com o mouse em cima de qualquer uma, todas param de pulsar:
          // assim o crescimento da bolinha apontada aparece limpo.
          const pausada = emFoco !== null

          return (
            <li
              key={id}
              className={`shrink-0 ${variacoes[i % variacoes.length]}`}
              onPointerEnter={podeHover ? () => setEmFoco(id) : undefined}
              onPointerLeave={podeHover ? () => setEmFoco(null) : undefined}
            >
              {/* duas camadas: a de fora cresce no hover, a de dentro respira.
                  Na mesma camada a animação sobrescreveria o crescimento. */}
              <span
                className={`block transition-transform duration-300 ${destacada ? 'scale-115' : ''}`}
              >
                <span
                  style={
                    menosMovimento
                      ? undefined
                      : { ...ritmo(i), animationPlayState: pausada ? 'paused' : 'running' }
                  }
                  className={`block ${menosMovimento ? '' : 'respira'}`}
                >
                  <SlotLogo id={id} alt={nomes[marca] ?? marca} />
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </Secao>
  )
}
