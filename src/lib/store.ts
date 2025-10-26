import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AnalysisResult {
  id: string
  timestamp: number
  imageThumbnail: string
  ladoRecomendado: 'azul' | 'vermelho'
  confianca: number
  modo: 'normal' | 'alavancagem'
  frequenciaAzul?: number
  frequenciaVermelho?: number
  recencia?: {
    n: number
    count: number
  }
  maxStreak?: number
  alternanciaIndex?: string
  padraoDetalhado?: string
  risco?: 'Baixo' | 'Médio' | 'Alto'
  valorSugerido?: number
  pergunta?: string
  resultado?: 'vitoria' | 'derrota'
}

export interface AppState {
  // Navegação
  currentScreen: 'home' | 'history' | 'goals' | 'bankroll' | 'premium'
  
  // Configurações
  banca: number
  modo: 'normal' | 'alavancagem'
  
  // Sistema de usuário
  isPremium: boolean
  
  // Estado da análise
  uploadedImage: string | null
  currentAnalysis: AnalysisResult | null
  isAnalyzing: boolean
  
  // Cooldown
  cooldownAtivo: boolean
  cooldownTimeLeft: number
  lastAnalysisTime: number | null
  
  // Histórico
  historico: AnalysisResult[]
  
  // Metas
  metas: {
    metaDiaria: number
    progresso: number
    progressoPercentual: number
  }
  
  // Actions
  setCurrentScreen: (screen: AppState['currentScreen']) => void
  setBanca: (banca: number) => void
  setModo: (modo: 'normal' | 'alavancagem') => void
  setIsPremium: (premium: boolean) => void
  setUploadedImage: (image: string | null) => void
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void
  setIsAnalyzing: (analyzing: boolean) => void
  startCooldown: () => void
  updateCooldown: (timeLeft: number) => void
  addToHistory: (analysis: AnalysisResult) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  updateMetaProgress: (progress: number) => void
  resetDailyProgress: () => void
  generateDailyGoal: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentScreen: 'home',
      banca: 1000,
      modo: 'normal',
      isPremium: false, // Por padrão, usuário é gratuito
      uploadedImage: null,
      currentAnalysis: null,
      isAnalyzing: false,
      cooldownAtivo: false,
      cooldownTimeLeft: 0,
      lastAnalysisTime: null,
      historico: [],
      metas: {
        metaDiaria: 40, // 4% de 1000
        progresso: 0,
        progressoPercentual: 0
      },

      // Actions
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      
      setBanca: (banca) => {
        set({ banca })
        // Recalcular meta diária automaticamente
        get().generateDailyGoal()
      },
      
      setModo: (modo) => set({ modo }),
      
      setIsPremium: (premium) => set({ isPremium: premium }),
      
      setUploadedImage: (image) => set({ uploadedImage: image }),
      
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      
      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
      
      startCooldown: () => {
        const now = Date.now()
        set({ 
          cooldownAtivo: true, 
          cooldownTimeLeft: 50,
          lastAnalysisTime: now
        })
      },
      
      updateCooldown: (timeLeft) => {
        set({ 
          cooldownTimeLeft: timeLeft,
          cooldownAtivo: timeLeft > 0
        })
      },
      
      addToHistory: (analysis) => {
        const { historico } = get()
        set({ 
          historico: [analysis, ...historico].slice(0, 50) // Manter apenas 50 últimas
        })
      },
      
      removeFromHistory: (id) => {
        const { historico } = get()
        set({ 
          historico: historico.filter(item => item.id !== id)
        })
      },
      
      clearHistory: () => set({ historico: [] }),
      
      updateMetaProgress: (progress) => {
        const { metas } = get()
        // CORREÇÃO: Somar o progresso ao valor atual em vez de substituir
        const newProgress = metas.progresso + progress
        const progressoPercentual = Math.round((newProgress / metas.metaDiaria) * 100)
        
        set({ 
          metas: {
            ...metas,
            progresso: newProgress,
            progressoPercentual
          }
        })
      },
      
      resetDailyProgress: () => {
        const { metas } = get()
        set({ 
          metas: {
            ...metas,
            progresso: 0,
            progressoPercentual: 0
          }
        })
      },
      
      generateDailyGoal: () => {
        const { banca, metas } = get()
        const metaDiaria = Math.round(banca * 0.04) // 4% ao dia
        const progressoPercentual = metas.progresso > 0 ? 
          Math.round((metas.progresso / metaDiaria) * 100) : 0
        
        set({ 
          metas: {
            ...metas,
            metaDiaria,
            progressoPercentual
          }
        })
      }
    }),
    {
      name: 'nextbet-storage',
      partialize: (state) => ({
        banca: state.banca,
        modo: state.modo,
        isPremium: state.isPremium,
        historico: state.historico,
        metas: state.metas,
        lastAnalysisTime: state.lastAnalysisTime
      })
    }
  )
)