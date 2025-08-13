import { getCurrentUser, signOut } from './auth.js'
import { getUserProfile, getUserStats, getAchievements, shareAchievement } from './api.js'
import { showNotification } from './ui.js'

let currentUser = null
let currentProfile = null
let currentStats = null
let allAchievements = []
let userAchievements = []
let currentFilter = 'all'
let selectedAchievement = null

// Inicializar página de conquistas
async function initializeAchievements() {
  try {
    showLoading(true)
    
    // Verificar autenticação
    const { data: { user }, error } = await getCurrentUser()
    
    if (error || !user) {
      console.log('Usuário não autenticado, redirecionando...')
      window.location.replace('/login.html')
      return
    }

    currentUser = user
    console.log('Usuário logado:', user.email)

    // Carregar dados
    await loadUserData()
    await loadAchievementsData()
    
    // Configurar interface
    setupEventListeners()
    updateStatistics()
    renderAchievements()

  } catch (error) {
    console.error('Erro ao inicializar conquistas:', error)
    showNotification('Erro ao carregar conquistas', 'error')
  } finally {
    showLoading(false)
  }
}

// Carregar dados do usuário
async function loadUserData() {
  const { data: profile, error: profileError } = await getUserProfile()
  
  if (profileError) {
    console.error('Erro ao carregar perfil:', profileError)
    showNotification('Erro ao carregar perfil', 'error')
    return
  }

  currentProfile = profile
  
  const { data: stats, error: statsError } = await getUserStats()
  
  if (statsError) {
    console.error('Erro ao carregar estatísticas:', statsError)
    // Criar stats de teste se não existir
    console.log('📊 Usando estatísticas de teste...')
    currentStats = {
      current_streak: 5,
      longest_streak: 12,
      total_habits_completed: 25,
      total_habits_created: 8,
      total_shares: 2
    }
  } else {
    currentStats = stats
  }

  console.log('Perfil:', profile)
  console.log('Stats:', currentStats)
}

// Carregar conquistas
async function loadAchievementsData() {
  const { data, error } = await getAchievements()
  
  if (error) {
    console.error('Erro ao carregar conquistas:', error)
    // Dados de teste para desenvolvimento
    console.log('🔧 Usando dados de teste...')
    allAchievements = [
      {
        id: '1',
        name: 'Primeiro Passo',
        description: 'Complete um hábito pela primeira vez',
        tier: 'bronze',
        category: 'streak',
        icon: '👶',
        requirement_type: 'habits_completed',
        requirement_value: 1,
        is_hidden: false
      },
      {
        id: '2',
        name: 'Constante',
        description: 'Mantenha uma sequência de 3 dias',
        tier: 'bronze',
        category: 'streak',
        icon: '🔥',
        requirement_type: 'streak_days',
        requirement_value: 3,
        is_hidden: false
      },
      {
        id: '3',
        name: 'Iniciante',
        description: 'Acumule 100 XP total',
        tier: 'bronze',
        category: 'xp',
        icon: '🌟',
        requirement_type: 'total_xp',
        requirement_value: 100,
        is_hidden: false
      }
    ]
    userAchievements = [
      { achievement_id: '1', unlocked_at: new Date().toISOString() }
    ]
    return
  }

  allAchievements = data.all_achievements || []
  userAchievements = data.user_achievements || []
  
  console.log('Conquistas carregadas:', allAchievements.length)
  console.log('Conquistas do usuário:', userAchievements.length)
}

// Atualizar estatísticas na interface
function updateStatistics() {
  const totalAchievements = document.getElementById('total-achievements')
  const currentStreak = document.getElementById('current-streak')
  const longestStreak = document.getElementById('longest-streak')
  const habitsCompleted = document.getElementById('habits-completed')

  if (totalAchievements) {
    totalAchievements.textContent = `${userAchievements.length}/${allAchievements.length}`
  }
  
  if (currentStreak && currentStats) {
    currentStreak.textContent = `${currentStats.current_streak || 0} dias`
  }
  
  if (longestStreak && currentStats) {
    longestStreak.textContent = `${currentStats.longest_streak || 0} dias`
  }
  
  if (habitsCompleted && currentStats) {
    habitsCompleted.textContent = currentStats.total_habits_completed || 0
  }
}

// Renderizar conquistas
function renderAchievements() {
  const categories = ['streak', 'xp', 'level', 'habits', 'social', 'special']
  
  categories.forEach(category => {
    const container = document.getElementById(`${category}-achievements`)
    if (!container) return

    const categoryAchievements = allAchievements.filter(a => a.category === category)
    container.innerHTML = ''

    categoryAchievements.forEach(achievement => {
      const isUnlocked = userAchievements.some(ua => ua.achievement_id === achievement.id)
      const achievementElement = createAchievementElement(achievement, isUnlocked)
      container.appendChild(achievementElement)
    })
  })

  // Aplicar filtro atual
  applyFilter(currentFilter)
}

// Criar elemento de conquista
function createAchievementElement(achievement, isUnlocked) {
  const div = document.createElement('div')
  div.className = `achievement-card ${achievement.tier} ${isUnlocked ? 'unlocked' : 'locked'}`
  
  const tierColors = {
    bronze: 'border-yellow-600 bg-yellow-50',
    prata: 'border-gray-400 bg-gray-50', 
    ouro: 'border-yellow-400 bg-yellow-100',
    diamante: 'border-blue-400 bg-blue-50',
    reliquia: 'border-purple-400 bg-purple-50'
  }

  const tierEmojis = {
    bronze: '🥉',
    prata: '🥈', 
    ouro: '🥇',
    diamante: '💎',
    reliquia: '🏺'
  }

  div.innerHTML = `
    <div class="nes-container is-rounded p-4 h-full ${tierColors[achievement.tier]} ${!isUnlocked ? 'opacity-60' : ''} cursor-pointer hover:scale-105 transition-transform">
      <div class="text-center">
        <div class="text-3xl mb-2">${isUnlocked ? achievement.icon : '🔒'}</div>
        <h4 class="text-sm mb-2 font-bold">${isUnlocked || !achievement.is_hidden ? achievement.name : '???'}</h4>
        <p class="text-xs text-gray-600 mb-3">${isUnlocked || !achievement.is_hidden ? achievement.description : 'Conquista secreta'}</p>
        <div class="flex justify-between items-center">
          <span class="text-xs px-2 py-1 rounded ${tierColors[achievement.tier]}">${tierEmojis[achievement.tier]} ${achievement.tier}</span>
          ${isUnlocked ? '<button class="nes-btn is-small share-achievement" data-achievement-id="' + achievement.id + '">📱</button>' : ''}
        </div>
      </div>
    </div>
  `

  // Event listener para abrir modal
  div.addEventListener('click', () => {
    if (isUnlocked) {
      openAchievementModal(achievement, true)
    } else if (!achievement.is_hidden) {
      openAchievementModal(achievement, false)
    }
  })

  return div
}

// Abrir modal de conquista
function openAchievementModal(achievement, isUnlocked) {
  selectedAchievement = achievement
  
  const modal = document.getElementById('achievement-modal')
  const icon = document.getElementById('modal-icon')
  const title = document.getElementById('modal-title')
  const description = document.getElementById('modal-description')
  const tier = document.getElementById('modal-tier')
  const shareBtn = document.getElementById('share-btn')

  icon.textContent = isUnlocked ? achievement.icon : '🔒'
  title.textContent = isUnlocked ? achievement.name : 'Conquista Bloqueada'
  description.textContent = isUnlocked ? achievement.description : `Alcance ${achievement.requirement_value} ${getRequirementText(achievement.requirement_type)}`
  
  tier.textContent = `${getTierEmoji(achievement.tier)} ${achievement.tier}`
  tier.className = `inline-block px-3 py-1 text-xs rounded-full ${getTierColor(achievement.tier)}`
  
  shareBtn.style.display = isUnlocked ? 'block' : 'none'
  
  modal.classList.remove('hidden')
}

// Aplicar filtro
function applyFilter(filter) {
  currentFilter = filter
  
  const allCards = document.querySelectorAll('.achievement-card')
  
  allCards.forEach(card => {
    let show = true
    
    if (filter === 'unlocked' && card.classList.contains('locked')) {
      show = false
    } else if (filter === 'locked' && card.classList.contains('unlocked')) {
      show = false
    } else if (filter !== 'all' && filter !== 'unlocked' && filter !== 'locked') {
      // Verificar se o card tem a classe do tier
      const hasTierClass = card.classList.contains(filter)
      if (!hasTierClass) {
        show = false
      }
    }
    
    card.style.display = show ? 'block' : 'none'
    
    // Mostrar/esconder seção pai se não houver cards visíveis
    const parentSection = card.closest('section')
    if (parentSection) {
      const visibleCards = parentSection.querySelectorAll('.achievement-card[style*="block"], .achievement-card:not([style*="none"])')
      const hasVisibleCards = Array.from(visibleCards).some(c => c.style.display !== 'none')
      parentSection.style.display = hasVisibleCards ? 'block' : 'none'
    }
  })

  // Atualizar botões de filtro
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active')
    if (btn.dataset.filter === filter) {
      btn.classList.add('active', 'is-primary')
    }
  })
}

// Compartilhar conquista
async function handleShareAchievement(platform) {
  if (!selectedAchievement) return

  try {
    showLoading(true)
    
    // Registrar compartilhamento
    const { error } = await shareAchievement(selectedAchievement.id)
    
    if (error) {
      console.error('Erro ao registrar compartilhamento:', error)
    }

    // Gerar texto e URL
    const text = `🎮 Desbloqueei a conquista "${selectedAchievement.name}" no HabitQuest RPG! ${selectedAchievement.icon}\n\n"${selectedAchievement.description}"\n\n#HabitQuestRPG #Gamificação #Hábitos`
    const url = window.location.origin.includes('localhost') 
      ? 'https://habitquestrpg.vercel.app' 
      : window.location.origin

    // URLs de compartilhamento
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
    }

    if (platform === 'copy') {
      // Copiar para clipboard
      await navigator.clipboard.writeText(text + '\n' + url)
      showNotification('Link copiado para a área de transferência! 📋', 'success')
    } else if (shareUrls[platform]) {
      // Abrir rede social
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
      showNotification('Conquista compartilhada! 🎉', 'success')
    }

    // Fechar modals
    closeShareModal()
    closeAchievementModal()

  } catch (error) {
    console.error('Erro ao compartilhar:', error)
    showNotification('Erro ao compartilhar conquista', 'error')
  } finally {
    showLoading(false)
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Navegação
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = '/dashboard'
  })

  document.getElementById('logout-btn').addEventListener('click', async () => {
    const { error } = await signOut()
    if (!error) {
      window.location.href = '/login.html'
    }
  })

  // Filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.dataset.filter)
    })
  })

  // Modals
  document.getElementById('close-modal-btn').addEventListener('click', closeAchievementModal)
  document.getElementById('share-btn').addEventListener('click', openShareModal)
  document.getElementById('close-share-modal').addEventListener('click', closeShareModal)

  // Compartilhamento
  document.getElementById('share-twitter').addEventListener('click', () => handleShareAchievement('twitter'))
  document.getElementById('share-facebook').addEventListener('click', () => handleShareAchievement('facebook'))
  document.getElementById('share-whatsapp').addEventListener('click', () => handleShareAchievement('whatsapp'))
  document.getElementById('share-linkedin').addEventListener('click', () => handleShareAchievement('linkedin'))
  document.getElementById('copy-link').addEventListener('click', () => handleShareAchievement('copy'))

  // Fechar modal clicando fora
  document.getElementById('achievement-modal').addEventListener('click', (e) => {
    if (e.target.id === 'achievement-modal') closeAchievementModal()
  })
  
  document.getElementById('share-modal').addEventListener('click', (e) => {
    if (e.target.id === 'share-modal') closeShareModal()
  })
}

// Funções auxiliares
function closeAchievementModal() {
  document.getElementById('achievement-modal').classList.add('hidden')
}

function openShareModal() {
  document.getElementById('share-modal').classList.remove('hidden')
}

function closeShareModal() {
  document.getElementById('share-modal').classList.add('hidden')
}

function showLoading(show) {
  const loading = document.getElementById('loading')
  if (show) {
    loading.classList.remove('hidden')
  } else {
    loading.classList.add('hidden')
  }
}

function getTierEmoji(tier) {
  const emojis = { bronze: '🥉', prata: '🥈', ouro: '🥇', diamante: '💎', reliquia: '🏺' }
  return emojis[tier] || '🏆'
}

function getTierColor(tier) {
  const colors = {
    bronze: 'bg-yellow-600 text-white',
    prata: 'bg-gray-400 text-white',
    ouro: 'bg-yellow-400 text-black',
    diamante: 'bg-blue-400 text-white',
    reliquia: 'bg-purple-400 text-white'
  }
  return colors[tier] || 'bg-gray-400 text-white'
}

function getRequirementText(type) {
  const texts = {
    streak_days: 'dias de sequência',
    total_xp: 'XP total',
    level_reached: 'de nível',
    habits_completed: 'hábitos completados',
    habits_created: 'hábitos criados',
    shares_made: 'compartilhamentos',
    special_condition: 'condições especiais'
  }
  return texts[type] || 'requisitos'
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏆 Página de conquistas carregada!')
  setTimeout(initializeAchievements, 100)
})
