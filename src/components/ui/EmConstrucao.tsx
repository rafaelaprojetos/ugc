import { Etiqueta } from '@/components/ui/Etiqueta'
import { JanelaMac } from '@/components/ui/JanelaMac'
import { useIdioma } from '@/hooks/useIdioma'
import type { SecaoId } from '@/content/types'

/** Placeholder temporário: some quando o conteúdo da seção entrar. */
export function EmConstrucao({ id }: { id: SecaoId }) {
  const { c } = useIdioma()
  return (
    <JanelaMac arquivo={c.secoes[id].janela} conteudoClassName="p-6 md:p-10">
      <div className="flex min-h-40 flex-col items-center justify-center gap-4 text-center">
        <Etiqueta cor="rosa-claro">{c.emConstrucao}</Etiqueta>
        <p className="text-sm text-tinta/70">#{id}</p>
      </div>
    </JanelaMac>
  )
}
