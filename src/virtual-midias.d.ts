declare module 'virtual:midias' {
  /** Mapa slot → arquivo encontrado em /public/assets. Gerado pelo plugin rc:midias. */
  export const arquivos: Record<
    string,
    { src: string; poster?: string; foraDoLugar?: boolean }
  >
}
