import pt from './pt.json'

/** O formato do conteúdo é definido por pt.json — en.json precisa bater com ele. */
export type Conteudo = typeof pt

export type NavItem = Conteudo['nav']['itens'][number]
export type SecaoId = keyof Conteudo['secoes']
/** A capa monta o próprio título; as outras seções usam a fita adesiva. */
export type SecaoComFita = Exclude<SecaoId, 'inicio'>
export type CorFita = 'lima' | 'rosa' | 'lilas' | 'rosa-claro'

export type Idioma = 'pt' | 'en'
