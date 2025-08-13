export function showNotification(message, type = 'success') {
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 p-4 rounded shadow-lg z-50 transition-all duration-300 ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`
  notification.textContent = message
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

export function renderHabits(habits, onComplete) {
  const container = document.getElementById('habits-container')
  if (!container) return

  container.innerHTML = ''

  if (!habits || habits.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8">
        <p class="text-gray-600 font-press-start text-sm">Nenhum hábito encontrado</p>
        <p class="text-gray-500 font-press-start text-xs mt-2">Crie seu primeiro hábito!</p>
      </div>
    `
    return
  }

  habits.forEach(habit => {
    const habitElement = document.createElement('div')
    habitElement.className = 'bg-white border-4 border-black p-4 mb-4 shadow-lg'
    habitElement.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <h3 class="font-press-start text-sm mb-2">${habit.name}</h3>
          ${habit.description ? `<p class="text-gray-600 text-xs mb-2">${habit.description}</p>` : ''}
          <span class="text-yellow-500 font-press-start text-xs">${habit.xp_value} XP</span>
        </div>
        <button 
          class="btn is-primary font-press-start text-xs px-4 py-2"
          onclick="completeHabit('${habit.id}', ${habit.xp_value})"
        >
          Completar
        </button>
      </div>
    `
    container.appendChild(habitElement)
  })
}

export function updateUserProfile(profile) {
  const usernameElement = document.getElementById('username')
  const levelElement = document.getElementById('level')
  const xpElement = document.getElementById('xp')
  const progressBarElement = document.getElementById('progress-bar')
  const avatarElement = document.getElementById('user-avatar')

  if (usernameElement) usernameElement.textContent = profile.username || 'Herói'
  if (levelElement) levelElement.textContent = `Nível ${profile.level}`
  if (avatarElement) {
    avatarElement.textContent = profile.gender === 'feminino' ? '👩' : '👨'
  }
  
  const currentLevelXp = (profile.level - 1) * 100
  const nextLevelXp = profile.level * 100
  const progressXp = profile.xp - currentLevelXp
  const progressPercent = (progressXp / 100) * 100

  if (xpElement) xpElement.textContent = `${progressXp}/100 XP`
  if (progressBarElement) {
    progressBarElement.style.width = `${progressPercent}%`
  }
}

export function showXpGainAnimation(xpGained) {
  const animation = document.createElement('div')
  animation.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-press-start text-2xl text-yellow-400 z-50 animate-bounce'
  animation.textContent = `+${xpGained} XP!`
  
  document.body.appendChild(animation)
  
  setTimeout(() => {
    animation.remove()
  }, 2000)
}
