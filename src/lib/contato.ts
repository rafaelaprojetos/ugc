import { links } from '@/content/media'

/**
 * Monta os links de contato só na hora de usar.
 * O e-mail e o WhatsApp nunca aparecem escritos no HTML da página,
 * então robôs que só leem o HTML não conseguem coletá-los.
 */
export function linkEmail(assunto?: string) {
  if (!links.email) return null
  const destino = links.email.split('').join('')
  const query = assunto ? `?subject=${encodeURIComponent(assunto)}` : ''
  return `${['mail', 'to'].join('')}:${destino}${query}`
}

/**
 * O WhatsApp agora é um link inteiro em media.ts — pode ser wa.me, link curto
 * ou link de grupo. Montado em tempo de execução, nunca escrito no HTML.
 *
 * Com `mensagem`, a conversa já abre com o texto digitado. Só funciona em link
 * do próprio WhatsApp (wa.me / api.whatsapp.com); link curto de terceiros
 * ignoraria o `?text=`, então nesse caso o texto não é acrescentado.
 */
export function linkWhatsapp(mensagem?: string) {
  const url = links.whatsapp.trim()
  if (!url) return null
  const completo = url.startsWith('http') ? url : `https://${url}`
  if (!mensagem) return completo
  if (!/(^https?:\/\/)(wa\.me|api\.whatsapp\.com)\//i.test(completo)) return completo
  const juncao = completo.includes('?') ? '&' : '?'
  return `${completo}${juncao}text=${encodeURIComponent(mensagem)}`
}

/** Exibe o e-mail quebrado em pedaços, para não virar uma string colhível. */
export function emailVisivel() {
  if (!links.email) return ''
  const [usuario, dominio] = links.email.split('@')
  return `${usuario}⁠@⁠${dominio}`
}
