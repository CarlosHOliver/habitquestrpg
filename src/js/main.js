import { onAuthStateChange, getCurrentUser, signOut } from './auth.js'
import { getHabits, completeHabit, getUserProfile, getDailyMissions } from './api.js'
import { renderHabits, updateUserProfile, showNotification, showXpGainAnimation, renderDailyMissions, showMissionCompleteAnimation } from './ui.js'

let currentUser = null

// Verificar autenticação na inicialização
async function initializeApp() {
  // Evitar loop infinito - verificar se já estamos na página de login
  const currentPath = window.location.pathname
  if (currentPath === '/login.html' || currentPath.includes('login')) {
    return
  }

  try {
    console.log('Verificando autenticação...')
    const { data: { user }, error } = await getCurrentUser()
    
    if (error || !user) {
      console.log('Usuário não autenticado, redirecionando para login...')
      window.location.replace('/login.html')
      return
    }

    console.log('Usuário autenticado:', user.email)
    currentUser = user
    await loadUserData()
    await loadHabits()
    await loadDailyMissions()
    setupEventListeners()
  } catch (error) {
    console.error('Erro ao inicializar app:', error)
    window.location.replace('/login.html')
  }
}

// Carregar dados do usuário
async function loadUserData() {
  console.log('Carregando dados do usuário...')
  const { data: profile, error } = await getUserProfile()
  
  if (error) {
    console.error('Erro ao carregar perfil:', error)
    showNotification('Erro ao carregar perfil do usuário: ' + error.message, 'error')
    return
  }

  console.log('Perfil carregado:', profile)
  updateUserProfile(profile)
}

// Carregar hábitos
async function loadHabits() {
  console.log('Carregando hábitos...')
  const { data: habits, error } = await getHabits()
  
  if (error) {
    console.error('Erro ao carregar hábitos:', error)
    showNotification('Erro ao carregar hábitos: ' + error.message, 'error')
    return
  }

  console.log('Hábitos carregados:', habits)
  renderHabits(habits)
}

// Carregar missões diárias
async function loadDailyMissions() {
  console.log('Carregando missões diárias...')
  const { data: missions, error } = await getDailyMissions()
  
  if (error) {
    console.error('Erro ao carregar missões diárias:', error)
    showNotification('Erro ao carregar missões diárias: ' + error.message, 'error')
    return
  }

  console.log('Missões diárias carregadas:', missions)
  renderDailyMissions(missions)
}

// Completar hábito
window.completeHabit = async (habitId, xpValue) => {
  const { data, error } = await completeHabit(habitId, xpValue)
  
  if (error) {
    showNotification('Erro ao completar hábito', 'error')
    return
  }

  showXpGainAnimation(xpValue)
  showNotification(`Hábito completado! +${xpValue} XP`, 'success')
  
  // Recarregar dados do usuário e missões
  await loadUserData()
  await loadDailyMissions()
}

// Configurar event listeners
function setupEventListeners() {
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { error } = await signOut()
      if (!error) {
        window.location.href = '/login.html'
      }
    })
  }

  const settingsBtn = document.getElementById('settings-btn')
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      window.location.href = '/settings'
    })
  }

  const achievementsBtn = document.getElementById('achievements-btn')
  if (achievementsBtn) {
    achievementsBtn.addEventListener('click', () => {
      window.location.href = '/achievements'
    })
  }

  const newHabitBtn = document.getElementById('new-habit-btn')
  if (newHabitBtn) {
    newHabitBtn.addEventListener('click', () => {
      // TODO: Abrir modal para criar novo hábito
      showNotification('Funcionalidade em desenvolvimento!', 'info')
    })
  }
}

// Monitorar mudanças de autenticação
onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event)
  if (event === 'SIGNED_OUT') {
    window.location.replace('/login.html')
  } else if (event === 'SIGNED_IN' && window.location.pathname.includes('login')) {
    window.location.replace('/dashboard')
  }
})

// Inicializar app quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // Adicionar delay pequeno para evitar problemas de timing
  setTimeout(initializeApp, 100)
})
