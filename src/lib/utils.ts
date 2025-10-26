import { AnalysisResult } from '@/lib/store'

// Função para gerar thumbnail da imagem
export const generateThumbnail = (imageUrl: string, maxWidth: number = 150): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    
    img.src = imageUrl
  })
}

// Função para simular análise IA com dados realistas
export const performAIAnalysis = async (imageUrl: string, modo: 'normal' | 'alavancagem', pergunta?: string): Promise<AnalysisResult> => {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Gerar dados aleatórios mas realistas
  const ladoRecomendado: 'azul' | 'vermelho' = Math.random() > 0.5 ? 'azul' : 'vermelho'
  const confianca = Math.floor(Math.random() * 35) + 65 // 65-100%
  
  // Dados de frequência (últimos 20)
  const frequenciaAzul = Math.floor(Math.random() * 8) + 6 // 6-14
  const frequenciaVermelho = 20 - frequenciaAzul
  
  // Dados de recência
  const nRecencia = Math.floor(Math.random() * 3) + 3 // 3-5
  const recenciaCount = Math.floor(Math.random() * nRecencia) + 1
  
  // Streak máximo
  const maxStreak = Math.floor(Math.random() * 4) + 3 // 3-6
  
  // Índice de alternância
  const alternanciaOptions = ['alto', 'médio', 'baixo']
  const alternanciaIndex = alternanciaOptions[Math.floor(Math.random() * alternanciaOptions.length)]
  
  // Padrão detectado - ajustar baseado na pergunta se fornecida
  let padroes = [
    'sequência curta seguida de reversão',
    'alternância regular detectada',
    'tendência de agrupamento',
    'padrão de streaks moderados',
    'distribuição equilibrada'
  ]
  
  // Se há pergunta, adaptar a resposta
  if (pergunta) {
    if (pergunta.toLowerCase().includes('padrão') || pergunta.toLowerCase().includes('sequência')) {
      padroes = [
        'padrão de alternância detectado nos últimos rounds',
        'sequência de repetições identificada',
        'tendência de agrupamento por cor'
      ]
    } else if (pergunta.toLowerCase().includes('chance') || pergunta.toLowerCase().includes('probabilidade')) {
      padroes = [
        `maior probabilidade para ${ladoRecomendado} baseado na análise`,
        'distribuição estatística favorece a recomendação',
        'análise de frequência indica tendência'
      ]
    }
  }
  
  const padraoDetalhado = padroes[Math.floor(Math.random() * padroes.length)]
  
  // Risco
  const riscos: ('Baixo' | 'Médio' | 'Alto')[] = ['Baixo', 'Médio', 'Alto']
  const risco = riscos[Math.floor(Math.random() * riscos.length)]
  
  // Gerar thumbnail
  const thumbnail = await generateThumbnail(imageUrl)
  
  const analysis: AnalysisResult = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    imageThumbnail: thumbnail,
    ladoRecomendado,
    confianca,
    modo,
    frequenciaAzul,
    frequenciaVermelho,
    recencia: {
      n: nRecencia,
      count: recenciaCount
    },
    maxStreak,
    alternanciaIndex,
    padraoDetalhado,
    risco
  }
  
  // Se modo alavancagem, adicionar valor sugerido
  if (modo === 'alavancagem') {
    const bancaBase = 1000 // Pegar da store depois
    const percentual = risco === 'Baixo' ? 0.02 : risco === 'Médio' ? 0.05 : 0.1
    analysis.valorSugerido = Math.round(bancaBase * percentual)
  }
  
  return analysis
}

// Função para formatar timestamp
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return `${diffInMinutes}min atrás`
  } else if (diffInHours < 24) {
    return `${diffInHours}h atrás`
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// Função para formatar tempo do cooldown
export const formatCooldownTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}