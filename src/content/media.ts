/**
 * MÍDIA — o mapa de todos os "slots" do site.
 *
 * Um slot é um lugar fixo para uma mídia: tem nome, pasta e formato definidos aqui.
 * Enquanto o arquivo não existe, o site mostra uma moldura listrada com o nome do slot.
 * Quando o arquivo aparece na pasta certa com o nome certo, o site troca sozinho.
 *
 *   npm run midias               → lista o que já tem arquivo e o que falta
 *   npm run midias -- --processar → comprime vídeos, gera posters, converte para WebP
 *
 * Os TEXTOS (legenda, marca, descrição) não ficam aqui — ficam em
 * src/content/pt.json e src/content/en.json, ligados pelo mesmo `id` do slot.
 */

export type TipoSlot = 'video' | 'foto' | 'logo' | 'sticker'
export type FormatoSlot = '9:16' | '4:5' | '16:9' | '1:1' | 'circulo'

export type Slot = {
  /** nome do arquivo (sem extensão) que você vai salvar */
  id: string
  tipo: TipoSlot
  /** pasta dentro de /public/assets onde o arquivo deve ser salvo */
  pasta: string
  formato: FormatoSlot
  /** só para organizar a página /slots */
  grupo: string
}

/** Extensões aceitas, em ordem de preferência quando houver mais de uma. */
export const extensoes: Record<TipoSlot, readonly string[]> = {
  video: ['.mp4', '.mov'],
  foto: ['.webp', '.jpg', '.jpeg', '.png'],
  logo: ['.svg', '.webp', '.png'],
  sticker: ['.webp', '.png', '.svg'],
}

/** Pasta onde ficam as thumbnails geradas automaticamente. */
export const pastaPosters = 'posters'

// ---------------------------------------------------------------------------
// Ajudantes para não repetir linha por linha
// ---------------------------------------------------------------------------

function numerados(
  grupo: string,
  pasta: string,
  molde: (n: number) => string,
  quantos: number,
  tipo: TipoSlot,
  formato: FormatoSlot,
): Slot[] {
  return Array.from({ length: quantos }, (_, i) => ({
    id: molde(i + 1),
    tipo,
    pasta,
    formato,
    grupo,
  }))
}

/** Um bloco de vídeos verticais: <prefixo>-video-1 .. <prefixo>-video-N */
function videos(grupo: string, prefixo: string, quantos: number): Slot[] {
  return numerados(grupo, `videos/${prefixo}`, (n) => `${prefixo}-video-${n}`, quantos, 'video', '9:16')
}

// ---------------------------------------------------------------------------
// OS SLOTS
// Para adicionar: acrescente uma linha. Para tirar: apague a linha.
// ---------------------------------------------------------------------------

/**
 * SUBFORMATOS — as linhas de vídeo do bloco do meio de #formatos, nesta ordem.
 *
 * Para adicionar um: acrescente uma linha aqui, crie a pasta
 * public/assets/videos/<pasta>/ e escreva o nome dela em `secoes.formatos.subformatos`
 * no pt.json e no en.json. Para tirar, apague a linha. Nenhum componente muda.
 */
export const subformatos = [
  { pasta: 'personagem', quantos: 4 },
  { pasta: 'vlog', quantos: 4 },
  { pasta: 'contraste', quantos: 4 },
  { pasta: 'tiktok-shop', quantos: 4 },
  { pasta: 'falando-com-a-camera', quantos: 4 },
  { pasta: 'dupla-criativa', quantos: 4 },
  { pasta: 'anuncios', quantos: 4 },
] as const

/**
 * Quantos cases a seção #cases tem. Para acrescentar um, aumente o número
 * aqui e adicione o case em `secoes.cases.lista` no pt.json e no en.json.
 */
export const quantosCases = 4

/** Stickers 3D decorativos. Hoje só o fone, que flutua em #virais. */
export const stickers = ['fone'] as const

/** Marcas dos logos. Troque pelo nome real da marca — vira "logo-<marca>". */
export const marcas = [
  'bioderma',
  'banila-co',
  'claro',
  'keune',
  'hollyland',
  'petrizi',
  'truss',
  'grand-palladium',
  'capcut',
  'brahma',
  'ulanzi',
  'qcy',
  'real-techniques',
  'nutribullet',
  'loreal',
  'disney-plus',
] as const

export const slots: Slot[] = [
  // Capa — uma foto só, horizontal
  { id: 'capa-foto', tipo: 'foto', pasta: 'fotos/capa', formato: '16:9', grupo: 'Capa' },

  // Sobre mim
  ...videos('Sobre mim', 'sobre', 1),

  // Mais virais
  ...videos('Mais virais', 'virais', 5),

  // Tech
  ...videos('Tech', 'tech', 8),

  // Formatos · subformatos (a lista acima manda)
  ...subformatos.flatMap((sub) => videos(`Formatos · ${sub.pasta}`, sub.pasta, sub.quantos)),

  // Formatos · viagens (bloco próprio, fora da lista de subformatos)
  ...videos('Viagens', 'viagens', 4),

  // Cases — aqui o número vem antes da palavra "video"
  ...numerados('Cases', 'videos/cases', (n) => `case-${n}-video`, quantosCases, 'video', '9:16'),

  // Logos das marcas
  ...marcas.map<Slot>((marca) => ({
    id: `logo-${marca}`,
    tipo: 'logo',
    pasta: 'logos',
    formato: 'circulo',
    grupo: 'Logos',
  })),

  // Stickers decorativos
  ...stickers.map<Slot>((nome) => ({
    id: `sticker-${nome}`,
    tipo: 'sticker',
    pasta: 'stickers',
    formato: '1:1',
    grupo: 'Stickers',
  })),
]

/** Busca um slot pelo nome. */
export function slot(id: string): Slot | undefined {
  return slots.find((s) => s.id === id)
}

/** Todos os slots de um grupo, na ordem em que foram declarados. */
export function slotsDoGrupo(grupo: string): Slot[] {
  return slots.filter((s) => s.grupo === grupo)
}


/**
 * NOME DA MARCA DE CADA VÍDEO — aparece numa etiqueta no topo do vídeo.
 * Deixe vazio e a etiqueta simplesmente não aparece.
 * Fica aqui, e não nos JSONs, porque nome de marca não muda de idioma:
 * assim você escreve uma vez só.
 */
export const marcasDosVideos: Record<string, string> = {
  'sobre-video-1': '',
  'virais-video-1': '',
  'virais-video-2': '',
  'virais-video-3': '',
  'virais-video-4': '',
  'virais-video-5': '',
  'tech-video-1': '',
  'tech-video-2': '',
  'tech-video-3': '',
  'tech-video-4': '',
  'tech-video-5': '',
  'tech-video-6': '',
  'tech-video-7': '',
  'tech-video-8': '',
  'personagem-video-1': '',
  'personagem-video-2': '',
  'personagem-video-3': '',
  'personagem-video-4': '',
  'vlog-video-1': '',
  'vlog-video-2': '',
  'vlog-video-3': '',
  'vlog-video-4': '',
  'contraste-video-1': '',
  'contraste-video-2': '',
  'contraste-video-3': '',
  'contraste-video-4': '',
  'tiktok-shop-video-1': '',
  'tiktok-shop-video-2': '',
  'tiktok-shop-video-3': '',
  'tiktok-shop-video-4': '',
  'falando-com-a-camera-video-1': '',
  'falando-com-a-camera-video-2': '',
  'falando-com-a-camera-video-3': '',
  'falando-com-a-camera-video-4': '',
  'dupla-criativa-video-1': '',
  'dupla-criativa-video-2': '',
  'dupla-criativa-video-3': '',
  'dupla-criativa-video-4': '',
  'anuncios-video-1': '',
  'anuncios-video-2': '',
  'anuncios-video-3': '',
  'anuncios-video-4': '',
  'viagens-video-1': '',
  'viagens-video-2': '',
  'viagens-video-3': '',
  'viagens-video-4': '',
  'case-1-video': '',
  'case-2-video': '',
  'case-3-video': '',
  'case-4-video': '',
}

// ---------------------------------------------------------------------------
// Links e domínio
// ---------------------------------------------------------------------------

import { embutido } from './embutido.ts'

export type Links = {
  email: string
  instagram: string
  youtube: string
  tiktok: string
  /** link inteiro do WhatsApp — cole o que quiser (wa.me, link curto, chat.whatsapp) */
  whatsapp: string
  /** WhatsApp do sócio da Seu Influencer — botão do card 3 de #entregaveis */
  whatsappSocio: string
  midiaKit: string
}

const linksPadrao: Links = {
  email: 'rafaelachagas@seuinfluencer.com.br',
  instagram: 'https://instagram.com/rafaelachagas',
  youtube: 'https://youtube.com/@canalrafaelachagas',
  tiktok: 'https://tiktok.com/@byrafaelachagas',
  whatsapp: 'https://wa.me/5537999689621',
  // PREENCHER: só números, com DDI. ex: 5511999998888
  whatsappSocio: '',
  midiaKit: '',
}

/** Links de contato e redes — trocar aqui vale para os dois idiomas. */
export const links: Links = { ...linksPadrao, ...(embutido.links ?? {}) }

/** Domínio oficial e caminho canônico de cada idioma. */
export const site = {
  dominio: 'https://rafaelacreator.com',
  caminhos: { pt: '/pt', en: '/en' },
} as const
