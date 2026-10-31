/** Fundo de seção: gradiente de céu com nuvens suaves e grão leve. */
export function FundoCeu() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="fundo-ceu absolute inset-0" />
      <div className="textura-grao absolute inset-0" />
    </div>
  )
}
