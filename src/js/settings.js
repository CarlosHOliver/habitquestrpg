import { getCurrentUser, signOut } from './auth.js'
import { getUserProfile, updateUserProfile, deleteUserAccount } from './api.js'
import { showNotification } from './ui.js'
import { supabase } from './supabaseClient.js'

let currentUser = null
let currentProfile = null

// Inicializar página de configurações
async function initializeSettings() {
  try {
    // Verificar autenticação
    const { data: { user }, error } = await getCurrentUser()
    
    if (error || !user) {
      console.log('Usuário não autenticado, redirecionando...')
      window.location.replace('/login.html')
      return
    }

    currentUser = user
    console.log('Usuário logado:', user.email)

    // Carregar perfil do usuário
    await loadUserProfile()
    
    // Configurar event listeners
    setupEventListeners()
    
    // Preencher dados atuais
    populateCurrentData()

  } catch (error) {
    console.error('Erro ao inicializar configurações:', error)
    showNotification('Erro ao carregar configurações', 'error')
  }
}

// Carregar perfil do usuário
async function loadUserProfile() {
  const { data: profile, error } = await getUserProfile()
  
  if (error) {
    console.error('Erro ao carregar perfil:', error)
    showNotification('Erro ao carregar perfil: ' + error.message, 'error')
    return
  }

  currentProfile = profile
  console.log('Perfil carregado:', profile)
}

// Preencher dados atuais na interface
function populateCurrentData() {
  if (currentUser) {
    document.getElementById('current-email').textContent = currentUser.email
  }
  
  if (currentProfile) {
    document.getElementById('current-username').textContent = currentProfile.username || 'Herói'
    document.getElementById('current-gender').textContent = 
      currentProfile.gender === 'feminino' ? '👩 Feminino' : '👨 Masculino'
    
    // Selecionar o radio button correto
    const genderRadio = document.querySelector(`input[name="new-gender"][value="${currentProfile.gender || 'masculino'}"]`)
    if (genderRadio) {
      genderRadio.checked = true
    }
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Botão voltar
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = '/dashboard'
  })

  // Botão logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    const { error } = await signOut()
    if (!error) {
      window.location.href = '/login.html'
    }
  })

  // Form alterar nome
  document.getElementById('username-form').addEventListener('submit', handleUsernameChange)

  // Form alterar gênero
  document.getElementById('gender-form').addEventListener('submit', handleGenderChange)

  // Form alterar email
  document.getElementById('email-form').addEventListener('submit', handleEmailChange)

  // Form alterar senha
  document.getElementById('password-form').addEventListener('submit', handlePasswordChange)

  // Botão excluir conta
  document.getElementById('delete-account-btn').addEventListener('click', showDeleteModal)

  // Modal de confirmação de exclusão
  setupDeleteModal()
}

// Alterar nome do usuário
async function handleUsernameChange(e) {
  e.preventDefault()
  showLoading(true)

  try {
    const newUsername = document.getElementById('new-username').value.trim()
    
    if (!newUsername) {
      showNotification('Digite um nome válido', 'error')
      return
    }

    if (newUsername === currentProfile?.username) {
      showNotification('O nome é o mesmo atual', 'warning')
      return
    }

    console.log('Alterando username para:', newUsername)

    // Atualizar no banco de dados
    const { data, error } = await updateUserProfile({ username: newUsername })

    if (error) {
      console.error('Erro ao atualizar username:', error)
      throw error
    }

    console.log('Username atualizado:', data)
    
    // Atualizar dados locais
    currentProfile.username = newUsername
    populateCurrentData()
    
    // Limpar form
    document.getElementById('new-username').value = ''
    
    showNotification('Nome do herói alterado com sucesso! 🎉', 'success')

  } catch (error) {
    console.error('Erro ao alterar nome:', error)
    showNotification('Erro ao alterar nome: ' + error.message, 'error')
  } finally {
    showLoading(false)
  }
}

// Alterar gênero do usuário
async function handleGenderChange(e) {
  e.preventDefault()
  showLoading(true)

  try {
    const newGender = document.querySelector('input[name="new-gender"]:checked')?.value
    
    if (!newGender) {
      showNotification('Selecione um gênero', 'error')
      return
    }

    if (newGender === currentProfile?.gender) {
      showNotification('O gênero é o mesmo atual', 'warning')
      return
    }

    console.log('Alterando gênero para:', newGender)

    // Atualizar no banco de dados
    const { data, error } = await updateUserProfile({ gender: newGender })

    if (error) {
      console.error('Erro ao atualizar gênero:', error)
      throw error
    }

    console.log('Gênero atualizado:', data)
    
    // Atualizar dados locais
    currentProfile.gender = newGender
    populateCurrentData()
    
    const genderText = newGender === 'feminino' ? '👩 Feminino' : '👨 Masculino'
    showNotification(`Gênero alterado para ${genderText}! ⚥`, 'success')

  } catch (error) {
    console.error('Erro ao alterar gênero:', error)
    showNotification('Erro ao alterar gênero: ' + error.message, 'error')
  } finally {
    showLoading(false)
  }
}

// Alterar email
async function handleEmailChange(e) {
  e.preventDefault()
  showLoading(true)

  try {
    const newEmail = document.getElementById('new-email').value.trim().toLowerCase()
    
    if (!newEmail) {
      showNotification('Digite um email válido', 'error')
      return
    }

    if (newEmail === currentUser.email) {
      showNotification('O email é o mesmo atual', 'warning')
      return
    }

    console.log('Alterando email para:', newEmail)

    // Atualizar email no Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail
    })

    if (error) {
      console.error('Erro ao atualizar email:', error)
      throw error
    }

    console.log('Email atualizado:', data)
    
    // Limpar form
    document.getElementById('new-email').value = ''
    
    showNotification('Email alterado com sucesso! Verifique seu novo email. 📧', 'success')

    // Atualizar dados na interface (será atualizado após confirmação)
    setTimeout(() => {
      window.location.reload()
    }, 2000)

  } catch (error) {
    console.error('Erro ao alterar email:', error)
    showNotification('Erro ao alterar email: ' + error.message, 'error')
  } finally {
    showLoading(false)
  }
}

// Alterar senha
async function handlePasswordChange(e) {
  e.preventDefault()
  showLoading(true)

  try {
    const currentPassword = document.getElementById('current-password').value
    const newPassword = document.getElementById('new-password').value
    const confirmPassword = document.getElementById('confirm-password').value
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification('Preencha todos os campos', 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      showNotification('As senhas não coincidem', 'error')
      return
    }

    if (newPassword.length < 6) {
      showNotification('A nova senha deve ter pelo menos 6 caracteres', 'error')
      return
    }

    console.log('Alterando senha...')

    // Primeiro, verificar senha atual fazendo login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: currentPassword
    })

    if (signInError) {
      console.error('Senha atual incorreta:', signInError)
      showNotification('Senha atual incorreta', 'error')
      return
    }

    // Atualizar senha
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Erro ao atualizar senha:', error)
      throw error
    }

    console.log('Senha atualizada:', data)
    
    // Limpar form
    document.getElementById('current-password').value = ''
    document.getElementById('new-password').value = ''
    document.getElementById('confirm-password').value = ''
    
    showNotification('Senha alterada com sucesso! 🔒', 'success')

  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    showNotification('Erro ao alterar senha: ' + error.message, 'error')
  } finally {
    showLoading(false)
  }
}

// Configurar modal de exclusão
function setupDeleteModal() {
  const modal = document.getElementById('delete-modal')
  const confirmInput = document.getElementById('delete-confirmation')
  const confirmBtn = document.getElementById('confirm-delete-btn')
  const cancelBtn = document.getElementById('cancel-delete-btn')

  // Verificar texto de confirmação
  confirmInput.addEventListener('input', () => {
    const isValid = confirmInput.value.trim().toUpperCase() === 'EXCLUIR'
    confirmBtn.disabled = !isValid
    confirmBtn.className = isValid ? 'nes-btn is-error flex-1' : 'nes-btn flex-1'
  })

  // Cancelar exclusão
  cancelBtn.addEventListener('click', hideDeleteModal)

  // Confirmar exclusão
  confirmBtn.addEventListener('click', handleDeleteAccount)

  // Fechar modal ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideDeleteModal()
    }
  })
}

// Mostrar modal de exclusão
function showDeleteModal() {
  document.getElementById('delete-modal').classList.remove('hidden')
  document.getElementById('delete-confirmation').value = ''
  document.getElementById('confirm-delete-btn').disabled = true
}

// Esconder modal de exclusão
function hideDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden')
}

// Excluir conta
async function handleDeleteAccount() {
  showLoading(true)
  hideDeleteModal()

  try {
    console.log('Iniciando exclusão da conta...')

    // Excluir dados do usuário via API
    const { error: deleteError } = await deleteUserAccount()
    
    if (deleteError) {
      console.error('Erro ao excluir dados do usuário:', deleteError)
      throw deleteError
    }

    console.log('Dados do usuário excluídos')

    // Fazer logout (a conta será "desabilitada" via exclusão dos dados)
    await supabase.auth.signOut()
    
    showNotification('Conta excluída com sucesso. Até logo! 👋', 'success')
    
    // Redirecionar para página inicial
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)

  } catch (error) {
    console.error('Erro ao excluir conta:', error)
    showNotification('Erro ao excluir conta: ' + error.message, 'error')
  } finally {
    showLoading(false)
  }
}

// Mostrar/esconder loading
function showLoading(show) {
  const loading = document.getElementById('loading')
  if (show) {
    loading.classList.remove('hidden')
  } else {
    loading.classList.add('hidden')
  }
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeSettings, 100)
})
