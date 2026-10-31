/** Qual seção está no topo da tela agora. Mesma régua do destaque do menu. */
export function secaoNoTopo(): string | null {
  const navH = Number.parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
    10,
  )
  const limite = (Number.isNaN(navH) ? 56 : navH) + 24

  let atual: string | null = null
  for (const el of document.querySelectorAll<HTMLElement>('section[id]')) {
    if (el.getBoundingClientRect().top - limite <= 0) atual = el.id
  }
  return atual
}
