import { SlotFoto } from '@/components/ui/SlotFoto'

type Props = {
  /** nome do slot, ex: "capa-foto-2" */
  id: string
  alt: string
  /** legenda escrita embaixo, estilo caneta */
  legenda?: string
  giro?: number
  className?: string
}

/** Foto em moldura polaroid, levemente rotacionada. */
export function Polaroid({ id, alt, legenda, giro = 0, className = '' }: Props) {
  return (
    <figure
      className={`rounded-[6px] border-2 border-tinta bg-branco p-2 pb-1 shadow-janela ${className}`}
      style={giro ? { transform: `rotate(${giro}deg)` } : undefined}
    >
      <SlotFoto id={id} alt={alt} className="rounded-[2px]" />
      {legenda && (
        <figcaption className="px-1 py-2 text-center text-xs font-semibold text-tinta/70">
          {legenda}
        </figcaption>
      )}
    </figure>
  )
}
