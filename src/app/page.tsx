'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Target, TrendingUp, Clock, Settings, History, DollarSign, Shield, AlertTriangle, Zap, Home, BarChart3, Trash2, Plus, ArrowLeft, Menu, X, Lock, Crown, CheckCircle, XCircle, RotateCcw, User, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { performAIAnalysis, formatTimestamp, formatCooldownTime } from '@/lib/utils'

export default function NextBetIA() {
  const {
    currentScreen,
    banca,
    modo,
    isPremium,
    uploadedImage,
    currentAnalysis,
    isAnalyzing,
    cooldownAtivo,
    cooldownTimeLeft,
    historico,
    metas,
    setCurrentScreen,
    setBanca,
    setModo,
    setIsPremium,
    setUploadedImage,
    setCurrentAnalysis,
    setIsAnalyzing,
    startCooldown,
    updateCooldown,
    addToHistory,
    removeFromHistory,
    clearHistory,
    updateMetaProgress,
    generateDailyGoal,
    resetDailyProgress
  } = useAppStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [bankrollInput, setBankrollInput] = useState(banca.toString())
  const [progressInput, setProgressInput] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userQuestion, setUserQuestion] = useState('')
  const [showResultInput, setShowResultInput] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Estados para autenticação
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })

  // Timer para cooldown
  useEffect(() => {
    if (cooldownAtivo && cooldownTimeLeft > 0) {
      const timer = setInterval(() => {
        updateCooldown(cooldownTimeLeft - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownAtivo, cooldownTimeLeft, updateCooldown])

  // Gerar meta diária ao carregar
  useEffect(() => {
    generateDailyGoal()
  }, [generateDailyGoal])

  // Verificar se usuário está logado (simulação com localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('nextbet_user')
    if (savedUser) {
      setIsLoggedIn(true)
      setCurrentUser(savedUser)
    }
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalysis = async () => {
    if (!uploadedImage || isAnalyzing) return
    if (modo === 'normal' && cooldownAtivo) return

    setIsAnalyzing(true)
    setShowResultInput(false)
    
    try {
      const analysis = await performAIAnalysis(uploadedImage, modo, userQuestion)
      setCurrentAnalysis(analysis)
      setShowResultInput(true)
      
      if (modo === 'normal') {
        startCooldown()
      }
    } catch (error) {
      console.error('Erro na análise:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleResultSubmit = (resultado: 'vitoria' | 'derrota') => {
    if (currentAnalysis) {
      const analysisWithResult = {
        ...currentAnalysis,
        resultado,
        pergunta: userQuestion
      }
      addToHistory(analysisWithResult)
      setShowResultInput(false)
      setUserQuestion('')
    }
  }

  const handleBankrollSave = () => {
    const newBanca = parseFloat(bankrollInput)
    if (!isNaN(newBanca) && newBanca > 0) {
      setBanca(newBanca)
      setCurrentScreen('home')
    }
  }

  const handleProgressUpdate = () => {
    const progress = parseFloat(progressInput)
    if (!isNaN(progress) && progress >= 0) {
      updateMetaProgress(progress)
      setProgressInput('')
    }
  }

  const handleResetDailyGoal = () => {
    setShowResetConfirm(true)
  }

  const confirmResetDailyGoal = () => {
    resetDailyProgress()
    setShowResetConfirm(false)
  }

  const cancelResetDailyGoal = () => {
    setShowResetConfirm(false)
  }

  // Funções de autenticação
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (authMode === 'register') {
      if (authForm.password !== authForm.confirmPassword) {
        alert('As senhas não coincidem!')
        return
      }
      if (authForm.password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!')
        return
      }
    }

    // Simulação de autenticação (em produção, seria uma API real)
    if (authMode === 'login') {
      // Simular login
      localStorage.setItem('nextbet_user', authForm.email)
      setCurrentUser(authForm.email)
      setIsLoggedIn(true)
      setCurrentScreen('home')
    } else {
      // Simular cadastro
      localStorage.setItem('nextbet_user', authForm.email)
      setCurrentUser(authForm.email)
      setIsLoggedIn(true)
      setCurrentScreen('home')
    }

    // Limpar formulário
    setAuthForm({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('nextbet_user')
    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentScreen('auth')
  }

  // Componente para funcionalidades bloqueadas
  const PremiumFeatureBlock = ({ title, description, onUpgrade }: { 
    title: string
    description: string
    onUpgrade: () => void 
  }) => (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
            <Lock className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
        <p className="text-gray-400 text-center mb-6 text-sm">{description}</p>
        <button
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <Crown className="w-4 h-4" />
          <span>Upgrade para Premium</span>
        </button>
      </div>
    </div>
  )

  // Verificar se funcionalidade é premium
  const isPremiumFeature = (feature: 'goals' | 'bankroll' | 'alavancagem') => {
    return !isPremium && ['goals', 'bankroll', 'alavancagem'].includes(feature)
  }

  // Renderizar tela de autenticação
  const renderAuthScreen = () => (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative">
                <Target className="w-10 h-10 text-[#0066FF]" />
                <div className="absolute inset-0 bg-[#0066FF] blur-lg opacity-30"></div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00C8FF] bg-clip-text text-transparent">
                NextBet.IA
              </h1>
            </div>
            <p className="text-gray-400 text-sm">
              {authMode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-800/50 rounded-lg p-1 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-[#0066FF] to-[#00C8FF] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-[#0066FF] to-[#00C8FF] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar</span>
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome completo
                </label>
                <input
                  type="text"
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:border-[#0066FF] focus:outline-none transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:border-[#0066FF] focus:outline-none transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 pr-12 text-white focus:border-[#0066FF] focus:outline-none transition-colors"
                  placeholder="Sua senha"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:border-[#0066FF] focus:outline-none transition-colors"
                  placeholder="Confirme sua senha"
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0066FF] to-[#00C8FF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {authMode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Criar conta</span>
                </>
              )}
            </button>
          </form>

          {/* Informações adicionais */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {authMode === 'login' 
                ? 'Não tem uma conta? Clique em "Cadastrar" acima.'
                : 'Já tem uma conta? Clique em "Entrar" acima.'
              }
            </p>
          </div>

          {/* Demo */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-3">Para demonstração:</p>
              <button
                onClick={() => {
                  setCurrentUser('demo@nextbet.ia')
                  setIsLoggedIn(true)
                  setCurrentScreen('home')
                }}
                className="w-full py-2 px-4 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-sm transition-colors"
              >
                Entrar como Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Menu de navegação mobile
  const renderMobileMenu = () => (
    <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
      <div className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-gray-900 to-gray-800 border-l border-gray-700 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold">Menu</h3>
            {isPremium && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                <Crown className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-semibold">PRO</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              setCurrentScreen('home')
              setMobileMenuOpen(false)
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentScreen === 'home' ? 'bg-[#0066FF]/20 text-[#00C8FF]' : 'hover:bg-gray-700/50'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Início</span>
          </button>
          <button
            onClick={() => {
              setCurrentScreen('history')
              setMobileMenuOpen(false)
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentScreen === 'history' ? 'bg-[#0066FF]/20 text-[#00C8FF]' : 'hover:bg-gray-700/50'
            }`}
          >
            <History className="w-5 h-5" />
            <span>Histórico</span>
          </button>
          <button
            onClick={() => {
              if (isPremiumFeature('goals')) {
                setCurrentScreen('premium')
              } else {
                setCurrentScreen('goals')
              }
              setMobileMenuOpen(false)
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentScreen === 'goals' ? 'bg-[#0066FF]/20 text-[#00C8FF]' : 'hover:bg-gray-700/50'
            } ${isPremiumFeature('goals') ? 'opacity-60' : ''}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Metas Diárias</span>
            {isPremiumFeature('goals') && <Lock className="w-4 h-4 text-yellow-500" />}
          </button>
          <button
            onClick={() => {
              if (isPremiumFeature('bankroll')) {
                setCurrentScreen('premium')
              } else {
                setCurrentScreen('bankroll')
              }
              setMobileMenuOpen(false)
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentScreen === 'bankroll' ? 'bg-[#0066FF]/20 text-[#00C8FF]' : 'hover:bg-gray-700/50'
            } ${isPremiumFeature('bankroll') ? 'opacity-60' : ''}`}
          >
            <DollarSign className="w-5 h-5" />
            <span>Configurar Banca</span>
            {isPremiumFeature('bankroll') && <Lock className="w-4 h-4 text-yellow-500" />}
          </button>
          <button
            onClick={() => {
              setCurrentScreen('premium')
              setMobileMenuOpen(false)
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentScreen === 'premium' ? 'bg-[#0066FF]/20 text-[#00C8FF]' : 'hover:bg-gray-700/50'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>Modo Alavancagem</span>
            {isPremiumFeature('alavancagem') && <Lock className="w-4 h-4 text-yellow-500" />}
          </button>

          {/* Logout */}
          <div className="pt-4 border-t border-gray-700/50">
            <button
              onClick={() => {
                handleLogout()
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-red-600/20 text-red-400"
            >
              <LogIn className="w-5 h-5 rotate-180" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* User Info Mobile */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="font-semibold mb-3 text-sm">Usuário</h4>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="truncate">{currentUser}</span>
            </div>
          </div>
        </div>

        {/* Stats Mobile */}
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="font-semibold mb-3 text-sm">Estatísticas</h4>
          <div className="space-y-2 text-xs text-gray-400">
            <div>Análises hoje: {historico.filter(h => 
              new Date(h.timestamp).toDateString() === new Date().toDateString()
            ).length}</div>
            <div>Total: {historico.length}</div>
            <div>Modo: {modo === 'normal' ? 'Normal (Gratuito)' : 'Alavancagem (Premium)'}</div>
          </div>
        </div>

        {/* Meta Mobile */}
        {isPremium && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="font-semibold mb-3 text-sm">Meta Diária</h4>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Objetivo</div>
              <div className="text-green-400 font-semibold text-sm">R$ {metas.metaDiaria.toFixed(2)}</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#0066FF] to-[#00C8FF] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metas.progressoPercentual, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400">{metas.progressoPercentual}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Renderizar tela de histórico
  const renderHistoryScreen = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold">Histórico de Análises</h2>
        </div>
        {historico.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Tudo</span>
          </button>
        )}
      </div>

      {historico.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 sm:w-16 h-12 sm:h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">Nenhuma análise ainda</h3>
          <p className="text-sm sm:text-base text-gray-500">Suas análises aparecerão aqui após serem realizadas</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {historico.map((item) => (
            <div key={item.id} className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50 p-4 backdrop-blur-sm">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <img
                  src={item.imageThumbnail}
                  alt="Thumbnail"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  {/* Pergunta do usuário */}
                  {item.pergunta && (
                    <div className="mb-3 p-3 bg-gray-800/30 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Pergunta:</div>
                      <div className="text-sm text-gray-200">{item.pergunta}</div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                        item.ladoRecomendado === 'azul' ? 'bg-blue-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-semibold text-sm sm:text-base">
                        {item.ladoRecomendado === 'azul' ? '🔵 AZUL' : '🔴 VERMELHO'}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-400">({item.confianca}%)</span>
                      
                      {/* Resultado da análise */}
                      {item.resultado && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                          item.resultado === 'vitoria' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {item.resultado === 'vitoria' ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Vitória</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Derrota</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromHistory(item.id)}
                      className="p-1 hover:bg-red-600/20 rounded text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
                    <span className="truncate">{formatTimestamp(item.timestamp)}</span>
                    <span className="capitalize ml-2">{item.modo}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Renderizar tela de metas
  const renderGoalsScreen = () => {
    if (isPremiumFeature('goals')) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentScreen('home')}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold">Metas Diárias</h2>
          </div>
          <PremiumFeatureBlock
            title="Metas Diárias Premium"
            description="Defina e acompanhe suas metas diárias de lucro com análises detalhadas de progresso."
            onUpgrade={() => setCurrentScreen('premium')}
          />
        </div>
      )
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold">Metas Diárias</h2>
        </div>

        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50 p-4 sm:p-6 backdrop-blur-sm">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Meta de Hoje</h3>
            <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
              R$ {metas.metaDiaria.toFixed(2)}
            </div>
            <p className="text-gray-400 text-sm">4% da sua banca atual</p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Progresso</span>
              <span className="text-sm font-semibold">{metas.progressoPercentual}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metas.progressoPercentual, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>R$ {metas.progresso.toFixed(2)}</span>
              <span>R$ {metas.metaDiaria.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Marcar Progresso (R$)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 sm:px-4 py-2 text-white focus:border-[#0066FF] focus:outline-none transition-colors text-sm sm:text-base"
                  placeholder="0.00"
                  step="0.01"
                />
                <button
                  onClick={handleProgressUpdate}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#0066FF] to-[#00C8FF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white rounded-lg font-semibold transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {metas.progressoPercentual >= 100 && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center mb-4">
                <div className="text-green-400 font-semibold mb-1">🎉 Meta Atingida!</div>
                <div className="text-sm text-green-300 mb-3">Parabéns! Você alcançou sua meta diária.</div>
                <button
                  onClick={handleResetDailyGoal}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg transition-colors text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Nova meta diária</span>
                </button>
              </div>
            )}

            {metas.progressoPercentual < 100 && (
              <div className="pt-4 border-t border-gray-600/30">
                <button
                  onClick={handleResetDailyGoal}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg transition-colors text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Nova meta diária</span>
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Isso irá zerar o progresso atual e manter o mesmo valor de meta
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Confirmação */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={cancelResetDailyGoal}></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirmar Reset</h3>
              <p className="text-gray-300 mb-6">
                Tem certeza que deseja reiniciar sua meta diária? O progresso atual será zerado, mas o valor da meta permanecerá o mesmo.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelResetDailyGoal}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmResetDailyGoal}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Renderizar tela de configuração de banca
  const renderBankrollScreen = () => {
    if (isPremiumFeature('bankroll')) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentScreen('home')}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold">Configurar Banca</h2>
          </div>
          <PremiumFeatureBlock
            title="Gestão de Banca Premium"
            description="Configure e gerencie sua banca com ferramentas avançadas de controle de risco e metas personalizadas."
            onUpgrade={() => setCurrentScreen('premium')}
          />
        </div>
      )
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentScreen('home')}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold">Configurar Banca</h2>
        </div>

        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50 p-4 sm:p-6 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor da Banca (R$)
              </label>
              <input
                type="number"
                value={bankrollInput}
                onChange={(e) => setBankrollInput(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 sm:px-4 py-3 text-white focus:border-[#0066FF] focus:outline-none transition-colors text-base sm:text-lg"
                placeholder="1000.00"
                step="0.01"
              />
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Informações</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <div>• Meta diária será 4% da banca</div>
                <div>• Valor atual: R$ {(parseFloat(bankrollInput) * 0.04 || 0).toFixed(2)}/dia</div>
                <div>• Recomendamos não apostar mais que 5% por jogada</div>
              </div>
            </div>

            <button
              onClick={handleBankrollSave}
              className="w-full bg-gradient-to-r from-[#0066FF] to-[#00C8FF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Salvar Configuração
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar tela premium
  const renderPremiumScreen = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setCurrentScreen('home')}
          className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold">NextBet.IA Premium</h2>
      </div>

      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50 p-4 sm:p-6 backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold mb-2">Upgrade para Premium</h3>
          <p className="text-gray-400 text-sm sm:text-base">Desbloqueie todas as funcionalidades avançadas</p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm sm:text-base">Modo Alavancagem - Análises ilimitadas</span>
            </div>
            <span className="text-green-400">✓</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-sm sm:text-base">Sem cooldown entre análises</span>
            </div>
            <span className="text-green-400">✓</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <span className="text-sm sm:text-base">Cálculo automático de valores</span>
            </div>
            <span className="text-green-400">✓</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-yellow-500" />
              <span className="text-sm sm:text-base">Metas diárias personalizadas</span>
            </div>
            <span className="text-green-400">✓</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-yellow-500" />
              <span className="text-sm sm:text-base">Gestão avançada de banca</span>
            </div>
            <span className="text-green-400">✓</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-yellow-500" />
              <span className="text-sm sm:text-base">Análise de risco detalhada</span>
            </div>
            <span className="text-green-400">✓</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg mb-6">
          <span className="font-medium text-sm sm:text-base">Status Atual</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isPremium ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <span className={`text-sm ${isPremium ? 'text-green-400' : 'text-gray-400'}`}>
              {isPremium ? 'Premium Ativo' : 'Gratuito'}
            </span>
          </div>
        </div>

        {!isPremium ? (
          <button
            onClick={() => setIsPremium(true)}
            className="w-full py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white flex items-center justify-center space-x-2"
          >
            <Crown className="w-4 h-4" />
            <span>Ativar Premium (Demo)</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-green-400 font-semibold mb-1 flex items-center justify-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>Premium Ativo!</span>
              </div>
              <div className="text-sm text-green-300">Todas as funcionalidades desbloqueadas</div>
            </div>
            <button
              onClick={() => setIsPremium(false)}
              className="w-full py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30"
            >
              Cancelar Premium (Demo)
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // Renderizar análise detalhada
  const renderAnalysisResult = () => {
    if (!currentAnalysis) return null

    return (
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-4 sm:p-6 backdrop-blur-sm">
        <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Resultado da Análise</h3>
        
        {/* Pergunta do usuário */}
        {userQuestion && (
          <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">Sua pergunta:</div>
            <div className="text-base text-gray-200">{userQuestion}</div>
          </div>
        )}
        
        <div className="space-y-4 sm:space-y-6">
          {/* Recomendação Principal */}
          <div className={`p-4 sm:p-6 rounded-xl border-2 ${
            currentAnalysis.ladoRecomendado === 'azul' 
              ? 'bg-blue-500/10 border-blue-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              🔷 Recomendação principal: APONTE para{' '}
              <span className="uppercase font-bold">
                {currentAnalysis.ladoRecomendado}
              </span>
            </div>
            <div className="text-base sm:text-lg mb-3 sm:mb-4">
              🔸 Confiança estimada: <span className="font-bold">{currentAnalysis.confianca}%</span>
            </div>

            {/* Barra de Confiança */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4 sm:mb-6">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  currentAnalysis.ladoRecomendado === 'azul' ? 'bg-blue-500' : 'bg-red-500'
                }`}
                style={{ width: `${currentAnalysis.confianca}%` }}
              ></div>
            </div>

            {/* Motivação/Evidências */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="font-semibold mb-3">Motivação / evidências:</div>
              <div>1. Frequência (últimos 20): Azul {currentAnalysis.frequenciaAzul} — Vermelho {currentAnalysis.frequenciaVermelho}</div>
              <div>2. Recência: Nos últimos {currentAnalysis.recencia?.n} rounds, {currentAnalysis.ladoRecomendado} apareceu {currentAnalysis.recencia?.count} vezes.</div>
              <div>3. Streaks detectados: maior streak observado = {currentAnalysis.maxStreak} (ex.: Azul 4 seguidas).</div>
              <div>4. Alternância: índice de alternância = {currentAnalysis.alternanciaIndex} (alto/médio/baixo).</div>
              <div>5. Padrão detectado: {currentAnalysis.padraoDetalhado}</div>
            </div>

            {/* Ação Sugerida */}
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-600/30">
              <div className="font-semibold mb-2">Ação sugerida:</div>
              <div className="space-y-1 text-xs sm:text-sm">
                <div>• Aposta recomendada: <span className="font-semibold uppercase">{currentAnalysis.ladoRecomendado}</span></div>
                <div>• Risco aproximado: <span className="font-semibold">{currentAnalysis.risco}</span></div>
                {currentAnalysis.valorSugerido && isPremium && (
                  <div>• Valor sugerido: <span className="font-semibold text-green-400">R$ {currentAnalysis.valorSugerido}</span></div>
                )}
              </div>
            </div>

            {/* Observações */}
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-600/30 text-xs text-gray-400">
              <div className="font-semibold mb-2">Observações:</div>
              <div>• A análise usa apenas o print salvo. Envie nova tabela para trocar de mesa.</div>
              {modo === 'normal' && (
                <div>• Este modo é limitado: análises com menor precisão e tempo de espera de 50s entre solicitações.</div>
              )}
              <div className="mt-2 font-semibold">Aviso: As análises são sugestões baseadas em padrões estatísticos e não garantem resultados.</div>
            </div>
          </div>

          {/* Input para resultado da análise */}
          {showResultInput && (
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-600/30">
              <h4 className="font-semibold mb-3 text-center">Como foi o resultado da sua aposta?</h4>
              <div className="flex gap-3">
                <button
                  onClick={() => handleResultSubmit('vitoria')}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Vitória</span>
                </button>
                <button
                  onClick={() => handleResultSubmit('derrota')}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Derrota</span>
                </button>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalysis}
              disabled={isAnalyzing || (modo === 'normal' && cooldownAtivo)}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                isAnalyzing || (modo === 'normal' && cooldownAtivo)
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#0066FF] to-[#00C8FF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white'
              }`}
            >
              {isAnalyzing ? 'Executando...' : 'Executar Nova Análise'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Enviar Nova Tabela
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar tela principal
  const renderHomeScreen = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Upload Section */}
          {!uploadedImage ? (
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-8 text-center backdrop-blur-sm">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="relative inline-block">
                    <Upload className="w-16 h-16 text-[#0066FF] mx-auto" />
                    <div className="absolute inset-0 bg-[#0066FF] blur-xl opacity-20"></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-4">Enviar Tabela de Resultados</h2>
                <p className="text-gray-400 mb-6">
                  Faça upload de um print da tabela de resultados para começar a análise inteligente
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-[#0066FF] to-[#00C8FF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Selecionar Imagem
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Imagem Carregada */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Tabela Carregada</h3>
                  <button
                    onClick={() => {
                      setUploadedImage(null)
                      setCurrentAnalysis(null)
                      setUserQuestion('')
                      setShowResultInput(false)
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Nova Imagem
                  </button>
                </div>
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Tabela carregada"
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* Botão de Análise */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Análise IA</h3>
                  <button
                    onClick={handleAnalysis}
                    disabled={isAnalyzing || (modo === 'normal' && cooldownAtivo)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      isAnalyzing || (modo === 'normal' && cooldownAtivo)
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#0066FF] to-[#00C8FF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white transform hover:scale-105'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Analisando...</span>
                      </>
                    ) : modo === 'normal' && cooldownAtivo ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Aguarde {formatCooldownTime(cooldownTimeLeft)}</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        <span>Iniciar Análise</span>
                      </>
                    )}
                  </button>
                </div>

                {currentAnalysis && renderAnalysisResult()}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-[#00C8FF]" />
              <span>Usuário</span>
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-400 truncate">{currentUser}</div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                <LogIn className="w-4 h-4 rotate-180" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-4">Navegação</h3>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentScreen('home')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentScreen === 'home' ? 'bg-[#0066FF]/20 text-[#00C8FF]' : 'hover:bg-gray-700/50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </button>
              <button
                onClick={() => setCurrentScreen('history')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentScreen === 'history' ? 'bg-[#0066FF]/20 text-[#00C8FF]' : 'hover:bg-gray-700/50'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Histórico</span>
              </button>
              <button
                onClick={() => {
                  if (isPremiumFeature('goals')) {
                    setCurrentScreen('premium')
                  } else {
                    setCurrentScreen('goals')
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentScreen === 'goals' ? 'bg-[#0066FF]/20 text-[#00C8FF]' : 'hover:bg-gray-700/50'
                } ${isPremiumFeature('goals') ? 'opacity-60' : ''}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Metas Diárias</span>
                {isPremiumFeature('goals') && <Lock className="w-4 h-4 text-yellow-500" />}
              </button>
              <button
                onClick={() => {
                  if (isPremiumFeature('bankroll')) {
                    setCurrentScreen('premium')
                  } else {
                    setCurrentScreen('bankroll')
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentScreen === 'bankroll' ? 'bg-[#0066FF]/20 text-[#00C8FF]' : 'hover:bg-gray-700/50'
                } ${isPremiumFeature('bankroll') ? 'opacity-60' : ''}`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Configurar Banca</span>
                {isPremiumFeature('bankroll') && <Lock className="w-4 h-4 text-yellow-500" />}
              </button>
              <button
                onClick={() => setCurrentScreen('premium')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentScreen === 'premium' ? 'bg-[#0066FF]/20 text-[#00C8FF]' : 'hover:bg-gray-700/50'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Modo Alavancagem</span>
                {isPremiumFeature('alavancagem') && <Lock className="w-4 h-4 text-yellow-500" />}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <History className="w-5 h-5 text-[#00C8FF]" />
              <span>Estatísticas</span>
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-400">Análises hoje: {historico.filter(h => 
                new Date(h.timestamp).toDateString() === new Date().toDateString()
              ).length}</div>
              <div className="text-sm text-gray-400">Total de análises: {historico.length}</div>
              <div className="text-sm text-gray-400">
                Modo atual: {modo === 'normal' ? 'Normal (Gratuito)' : 'Alavancagem (Premium)'}
              </div>
              <div className="text-sm text-gray-400 flex items-center space-x-2">
                <span>Plano:</span>
                {isPremium ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                    <Crown className="w-3 h-3 text-white" />
                    <span className="text-xs text-white font-semibold">PRO</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Gratuito</span>
                )}
              </div>
            </div>
          </div>

          {/* Metas Preview */}
          {isPremium && (
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-[#00C8FF]" />
                <span>Meta Diária</span>
              </h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="text-gray-400">Objetivo</div>
                  <div className="text-green-400 font-semibold">R$ {metas.metaDiaria.toFixed(2)}</div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-400">Progresso</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-[#0066FF] to-[#00C8FF] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(metas.progressoPercentual, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{metas.progressoPercentual}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Upload Section Mobile */}
        {!uploadedImage ? (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-6 text-center backdrop-blur-sm">
            <div className="mb-6">
              <div className="relative inline-block">
                <Upload className="w-12 h-12 text-[#0066FF] mx-auto" />
                <div className="absolute inset-0 bg-[#0066FF] blur-xl opacity-20"></div>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4">Enviar Tabela de Resultados</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Faça upload de um print da tabela de resultados para começar a análise inteligente
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gradient-to-r from-[#0066FF] to-[#00C8FF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Selecionar Imagem
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        ) : (
          <>
            {/* Imagem Carregada Mobile */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Tabela Carregada</h3>
                <button
                  onClick={() => {
                    setUploadedImage(null)
                    setCurrentAnalysis(null)
                    setUserQuestion('')
                    setShowResultInput(false)
                  }}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                >
                  Nova Imagem
                </button>
              </div>
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Tabela carregada"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Botão de Análise Mobile */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 p-4 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold">Análise IA</h3>
                <button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing || (modo === 'normal' && cooldownAtivo)}
                  className={`w-full sm:w-auto px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 text-sm ${
                    isAnalyzing || (modo === 'normal' && cooldownAtivo)
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#0066FF] to-[#00C8FF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analisando...</span>
                    </>
                  ) : modo === 'normal' && cooldownAtivo ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Aguarde {formatCooldownTime(cooldownTimeLeft)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>Iniciar Análise</span>
                    </>
                  )}
                </button>
              </div>

              {currentAnalysis && renderAnalysisResult()}
            </div>
          </>
        )}
      </div>
    </div>
  )

  // Se não estiver logado, mostrar tela de autenticação
  if (!isLoggedIn) {
    return renderAuthScreen()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0D] via-[#1A1A1D] to-[#0B0B0D] text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm bg-black/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Target className="w-6 sm:w-8 h-6 sm:h-8 text-[#0066FF]" />
                <div className="absolute inset-0 bg-[#0066FF] blur-lg opacity-30"></div>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00C8FF] bg-clip-text text-transparent">
                NextBet.IA
              </h1>
              {isPremium && (
                <div className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                  <Crown className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-semibold">PRO</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* User Info - Desktop */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                <User className="w-4 h-4" />
                <span className="max-w-32 truncate">{currentUser}</span>
              </div>

              {/* Mode Toggle - Hidden on small screens */}
              <div className="hidden sm:flex items-center bg-gray-900/50 rounded-full p-1 border border-gray-700/50">
                <button
                  onClick={() => setModo('normal')}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                    modo === 'normal'
                      ? 'bg-gradient-to-r from-[#0066FF] to-[#00C8FF] text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => {
                    if (isPremiumFeature('alavancagem')) {
                      setCurrentScreen('premium')
                    } else {
                      setModo('alavancagem')
                    }
                  }}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center space-x-1 ${
                    modo === 'alavancagem'
                      ? 'bg-gradient-to-r from-[#0066FF] to-[#00C8FF] text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  } ${isPremiumFeature('alavancagem') ? 'opacity-60' : ''}`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Alavancagem</span>
                  {isPremiumFeature('alavancagem') && <Lock className="w-3 h-3 text-yellow-500" />}
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Mode Toggle */}
          <div className="sm:hidden mt-4 flex items-center bg-gray-900/50 rounded-full p-1 border border-gray-700/50">
            <button
              onClick={() => setModo('normal')}
              className={`flex-1 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                modo === 'normal'
                  ? 'bg-gradient-to-r from-[#0066FF] to-[#00C8FF] text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Modo Normal
            </button>
            <button
              onClick={() => {
                if (isPremiumFeature('alavancagem')) {
                  setCurrentScreen('premium')
                } else {
                  setModo('alavancagem')
                }
              }}
              className={`flex-1 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center space-x-1 ${
                modo === 'alavancagem'
                  ? 'bg-gradient-to-r from-[#0066FF] to-[#00C8FF] text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              } ${isPremiumFeature('alavancagem') ? 'opacity-60' : ''}`}
            >
              <Zap className="w-3 h-3" />
              <span>Alavancagem</span>
              {isPremiumFeature('alavancagem') && <Lock className="w-3 h-3 text-yellow-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {renderMobileMenu()}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentScreen === 'home' && renderHomeScreen()}
        {currentScreen === 'history' && renderHistoryScreen()}
        {currentScreen === 'goals' && renderGoalsScreen()}
        {currentScreen === 'bankroll' && renderBankrollScreen()}
        {currentScreen === 'premium' && renderPremiumScreen()}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center text-xs sm:text-sm text-gray-400">
            As análises da IA representam padrões estatísticos e não garantem resultados. Utilize com responsabilidade.
          </div>
        </div>
      </footer>
    </div>
  )
}