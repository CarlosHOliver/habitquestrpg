import { onAuthStateChange, getCurrentUser, signOut } from './auth.js'
import { getHabits, completeHabit, getUserProfile } from './api.js'
import { renderHabits, updateUserProfile, showNotification, showXpGainAnimation } from './ui.js'

let currentUser = null

// Verificar autenticação na inicialização
async function initializeApp() {
  const { data: { user } } = await getCurrentUser()
  
  if (!user) {
    window.location.href = '/login.html'
    return
  }

  currentUser = user
  await loadUserData()
  await loadHabits()
  setupEventListeners()
}

// Carregar dados do usuário
async function loadUserData() {
  const { data: profile, error } = await getUserProfile()
  
  if (error) {
    showNotification('Erro ao carregar perfil do usuário', 'error')
    return
  }

  updateUserProfile(profile)
}

// Carregar hábitos
async function loadHabits() {
  const { data: habits, error } = await getHabits()
  
  if (error) {
    showNotification('Erro ao carregar hábitos', 'error')
    return
  }

  renderHabits(habits)
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
  
  // Recarregar dados do usuário
  await loadUserData()
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
  if (event === 'SIGNED_OUT') {
    window.location.href = '/login.html'
  }
})

// Inicializar app quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeApp)
