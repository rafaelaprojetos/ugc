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
 * Larguras entre 16 (64px) e 32 (128px): é o que tira a cara de grade.
 */
const variacoes = [
  'lg:w-28 lg:translate-y-0',
  'lg:w-20 lg:translate-y-6',
  'lg:w-32 lg:-translate-y-4',
  'lg:w-16 lg:translate-y-3',
  'lg:w-24 lg:-translate-y-7',
  'lg:w-32 lg:translate-y-4',
  'lg:w-20 lg:-translate-y-2',
  'lg:w-28 lg:translate-y-8',
  'lg:w-16 lg:-translate-y-5',
  'lg:w-24 lg:translate-y-1',
  'lg:w-32 lg:-translate-y-6',
  'lg:w-20 lg:translate-y-5',
  'lg:w-28 lg:-translate-y-3',
  'lg:w-16 lg:translate-y-7',
  'lg:w-24 lg:-translate-y-8',
  'lg:w-32 lg:translate-y-2',
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
      <ul className="grid grid-cols-4 gap-3 md:grid-cols-6 md:gap-5 lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-7">
        {marcas.map((marca, i) => {
          const id = `logo-${marca}`
          const destacada = emFoco === id
          // Com o mouse em cima de qualquer uma, todas param de pulsar:
          // assim o crescimento da bolinha apontada aparece limpo.
          const pausada = emFoco !== null

          return (
            <li
              key={id}
              className={`w-full ${variacoes[i % variacoes.length]}`}
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
