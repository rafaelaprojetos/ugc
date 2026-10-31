import { IconeRede } from '@/components/ui/IconeRede'
import { links } from '@/content/media'
import { useIdioma } from '@/hooks/useIdioma'

export function Rodape() {
  const { c } = useIdioma()

  return (
    <footer className="border-t-2 border-tinta bg-rosa">
      <div className="container-site flex flex-col items-center gap-5 py-10 text-center">
        <ul aria-label={c.rodape.redesLabel} className="flex items-center gap-3">
          {c.rodape.redes.map((rede) => {
            const url = links[rede.chave as keyof typeof links]
            if (!url) return null
            return (
              <li key={rede.chave}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={rede.nome}
                  className="alvo-toque flex items-center justify-center rounded-full border-2 border-tinta bg-branco text-tinta shadow-colagem transition-colors hover:bg-lima"
                >
                  <IconeRede rede={rede.chave} className="size-5" />
                </a>
              </li>
            )
          })}
        </ul>

        <p className="text-sm font-semibold text-tinta">{c.rodape.direitos}</p>

        <a
          href="#inicio"
          className="alvo-toque inline-flex items-center rounded-pill border-2 border-tinta bg-lima px-5 py-2 text-sm font-semibold"
        >
          {c.rodape.voltarAoTopo}
        </a>
      </div>
    </footer>
  )
}
