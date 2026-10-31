import { ContadorAnimado } from '@/components/ui/ContadorAnimado'
import { Secao } from '@/components/ui/Secao'
import { useEntrouNaTela } from '@/hooks/useEntrouNaTela'
import { useIdioma } from '@/hooks/useIdioma'

/** Giro de cada notificação, para a pilha não ficar perfeitamente alinhada. */
const giros = [-1.5, 1.8, -1, 1.2]

export function Saber() {
  const { c } = useIdioma()
  const s = c.secoes.saber
  const { ref, entrou } = useEntrouNaTela<HTMLDivElement>(0.2)

  return (
    <Secao id="saber" tamanho="grande">
      {/* Quadrado colorido: separa esta seção do céu das outras */}
      <div
        ref={ref}
        className="mx-auto flex w-full max-w-[560px] flex-col justify-center gap-4 rounded-[36px] border-[3px] border-tinta bg-lima p-5 shadow-janela md:gap-5 md:p-8 lg:aspect-square lg:p-12"
      >
        <ul className="flex flex-col gap-4 md:gap-5">
          {s.itens.map((item, i) => {
            // o texto vem com {numero} no meio; o contador entra no lugar
            const [antes, depois] = item.texto.split('{numero}')

            return (
              <li
                key={item.texto}
                style={{
                  transform: `rotate(${giros[i % giros.length]}deg)`,
                  transitionDelay: entrou ? `${i * 220}ms` : '0ms',
                }}
                className={`flex items-start gap-3 rounded-janela border-2 border-tinta bg-branco p-4 shadow-janela transition-all duration-500 md:gap-4 md:p-5 ${
                  entrou ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[10px] border-2 border-tinta bg-rosa text-base md:size-11"
                >
                  ✨
                </span>

                <p className="min-w-0 text-base leading-snug text-tinta md:text-xl">
                  {/* leitor de tela recebe a frase inteira, já com o número final */}
                  <span className="sr-only">
                    {antes}
                    {item.numero.ate}
                    {item.numero.sufixo}
                    {depois}
                  </span>
                  <span aria-hidden="true">
                    {antes}
                    <ContadorAnimado
                      ate={item.numero.ate}
                      sufixo={item.numero.sufixo}
                      ativo={entrou}
                    />
                    {depois}
                  </span>
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </Secao>
  )
}
