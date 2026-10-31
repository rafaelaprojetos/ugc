import { domAnimation, LazyMotion } from 'framer-motion'
import { PaginaSlots } from '@/paginas/PaginaSlots'
import { BarraTopo } from '@/components/layout/BarraTopo'
import { Rodape } from '@/components/layout/Rodape'
import { FundoCeu } from '@/components/ui/FundoCeu'
import { PopupOrcamento } from '@/components/ui/PopupOrcamento'
import { Cases } from '@/sections/Cases'
import { Contato } from '@/sections/Contato'
import { Entregaveis } from '@/sections/Entregaveis'
import { Formatos } from '@/sections/Formatos'
import { Inicio } from '@/sections/Inicio'
import { Marcas } from '@/sections/Marcas'
import { Saber } from '@/sections/Saber'
import { Sobre } from '@/sections/Sobre'
import { Virais } from '@/sections/Virais'
import { ProvedorIdioma } from '@/lib/i18n'

export default function App() {
  // Conferência das mídias — só em desenvolvimento.
  // No build de produção import.meta.env.DEV vira false e esta página
  // é removida do pacote junto com o trecho.
  if (import.meta.env.DEV && window.location.pathname.replace(/\/+$/, '') === '/slots') {
    return <PaginaSlots />
  }

  return (
    <ProvedorIdioma>
      <LazyMotion features={domAnimation} strict>
        <FundoCeu />
        <BarraTopo />
        <main className="pt-[var(--nav-h)]">
          <Inicio />
          <Sobre />
          <Virais />
          <Marcas />
          <Formatos />
          <Cases />
          <Entregaveis />
          <Saber />
          <Contato />
        </main>
        <Rodape />
        <PopupOrcamento />
      </LazyMotion>
    </ProvedorIdioma>
  )
}
