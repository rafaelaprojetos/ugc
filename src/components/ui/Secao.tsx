import type { ReactNode } from 'react'
import { FitaTitulo } from '@/components/ui/FitaTitulo'
import type { CorFita, SecaoComFita } from '@/content/types'
import { useIdioma } from '@/hooks/useIdioma'

type Props = {
  id: SecaoComFita
  children?: ReactNode
  nivel?: 'h1' | 'h2'
  tamanho?: 'grande' | 'gigante' | 'mega'
  className?: string
}

/** Casca de seção: id correto para a navegação + título em fita adesiva. */
export function Secao({ id, children, nivel = 'h2', tamanho = 'gigante', className = '' }: Props) {
  const { c } = useIdioma()
  const secao = c.secoes[id]

  return (
    <section
      id={id}
      aria-labelledby={`titulo-${id}`}
      className={`relative py-14 md:py-24 ${className}`}
    >
      <div className="container-site">
        <FitaTitulo
          id={`titulo-${id}`}
          palavra={secao.fita.palavra}
          corPalavra={secao.fita.corPalavra as CorFita}
          corFita={secao.fita.corFita as CorFita}
          nivel={nivel}
          tamanho={tamanho}
        />
        {children && <div className="mt-8 md:mt-12">{children}</div>}
      </div>
    </section>
  )
}
