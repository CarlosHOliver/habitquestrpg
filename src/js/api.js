import { supabase } from './supabaseClient.js'

// Funções para gerenciar hábitos
export async function createHabit(name, description, xpValue) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name,
        description,
        xp_value: xpValue
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getHabits() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function completeHabit(habitId, xpValue) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Registrar o log do hábito
    const { error: logError } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habitId,
        user_id: user.id
      })

    if (logError) throw logError

    // Atualizar XP do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    const newXp = profile.xp + xpValue
    const newLevel = Math.floor(newXp / 100) + 1 // 100 XP por nível

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xp: newXp,
        level: newLevel
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Atualizar estatísticas do usuário
    await updateUserStats(true, false) // hábito completado

    // Atualizar progresso das missões diárias
    await updateMissionProgress()

    return { data: { newXp, newLevel }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // Se o perfil não existe, tentar criar um
      if (error.code === 'PGRST116') {
        console.log('Perfil não encontrado, criando...')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.user_metadata?.username || 'Herói',
            gender: user.user_metadata?.gender || 'masculino',
            xp: 0,
            level: 1
          })
          .select()
          .single()

        if (createError) throw createError
        return { data: newProfile, error: null }
      }
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return { data: null, error }
  }
}

// Atualizar perfil do usuário
export async function updateUserProfile(updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return { data: null, error }
  }
}

// Excluir conta do usuário (e todos os dados relacionados)
export async function deleteUserAccount() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    console.log('Excluindo dados do usuário:', user.id)

    // Excluir logs de hábitos
    const { error: logsError } = await supabase
      .from('habit_logs')
      .delete()
      .eq('user_id', user.id)

    if (logsError) {
      console.error('Erro ao excluir logs:', logsError)
      // Não vamos parar por causa dos logs
    }

    // Excluir hábitos
    const { error: habitsError } = await supabase
      .from('habits')
      .delete()
      .eq('user_id', user.id)

    if (habitsError) {
      console.error('Erro ao excluir hábitos:', habitsError)
      // Não vamos parar por causa dos hábitos
    }

    // Excluir perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Erro ao excluir perfil:', profileError)
      // Não vamos parar por causa do perfil
    }

    console.log('Todos os dados do usuário foram excluídos')
    return { error: null }
    
  } catch (error) {
    console.error('Erro ao excluir conta:', error)
    return { error }
  }
}

// Obter estatísticas do usuário
export async function getUserStats() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Se não existe, criar stats
    if (error && error.code === 'PGRST116') {
      const { data: newStats, error: createError } = await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          total_habits_completed: 0,
          total_habits_created: 0,
          total_shares: 0
        })
        .select()
        .single()

      if (createError) throw createError
      return { data: newStats, error: null }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return { data: null, error }
  }
}

// Obter conquistas e conquistas do usuário
export async function getAchievements() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar todas as conquistas
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('requirement_value', { ascending: true })

    if (achievementsError) throw achievementsError

    // Buscar conquistas do usuário
    const { data: userAchievements, error: userError } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', user.id)

    if (userError) throw userError

    return { 
      data: { 
        all_achievements: allAchievements, 
        user_achievements: userAchievements 
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error)
    return { data: null, error }
  }
}

// Verificar e desbloquear conquistas
export async function checkAchievements() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Chamar função do banco para verificar conquistas
    const { error } = await supabase.rpc('check_achievements', {
      user_uuid: user.id
    })

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Erro ao verificar conquistas:', error)
    return { error }
  }
}

// Registrar compartilhamento de conquista
export async function shareAchievement(achievementId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Atualizar timestamp de compartilhamento
    const { error: updateError } = await supabase
      .from('user_achievements')
      .update({ shared_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId)

    if (updateError) throw updateError

    // Incrementar contador de shares nas estatísticas
    const { error: statsError } = await supabase.rpc('increment_user_shares', {
      user_uuid: user.id
    })

    if (statsError) {
      // Se a função não existir, fazer update manual
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('total_shares')
        .eq('user_id', user.id)
        .single()

      if (currentStats) {
        await supabase
          .from('user_stats')
          .update({ total_shares: (currentStats.total_shares || 0) + 1 })
          .eq('user_id', user.id)
      }
    }

    return { error: null }
  } catch (error) {
    console.error('Erro ao compartilhar conquista:', error)
    return { error }
  }
}

// Atualizar estatísticas após completar hábito
export async function updateUserStats(habitCompleted = false, habitCreated = false) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar ou criar stats
    let { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!stats) {
      // Criar stats se não existir
      const { data: newStats, error: createError } = await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          total_habits_completed: 0,
          total_habits_created: 0,
          total_shares: 0,
          last_habit_date: habitCompleted ? new Date().toISOString().split('T')[0] : null
        })
        .select()
        .single()

      if (createError) throw createError
      stats = newStats
    }

    // Calcular atualizações
    const updates = { updated_at: new Date().toISOString() }

    if (habitCompleted) {
      updates.total_habits_completed = (stats.total_habits_completed || 0) + 1
      
      const today = new Date().toISOString().split('T')[0]
      const lastHabitDate = stats.last_habit_date
      
      if (lastHabitDate) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        if (lastHabitDate === yesterdayStr) {
          // Continua streak
          updates.current_streak = (stats.current_streak || 0) + 1
        } else if (lastHabitDate !== today) {
          // Quebra streak
          updates.current_streak = 1
        }
        // Se lastHabitDate === today, não altera streak (já completou hoje)
      } else {
        // Primeiro hábito
        updates.current_streak = 1
      }
      
      updates.last_habit_date = today
      updates.longest_streak = Math.max(stats.longest_streak || 0, updates.current_streak || stats.current_streak || 0)
    }

    if (habitCreated) {
      updates.total_habits_created = (stats.total_habits_created || 0) + 1
    }

    // Atualizar no banco
    const { error } = await supabase
      .from('user_stats')
      .update(updates)
      .eq('user_id', user.id)

    if (error) throw error

    // Verificar conquistas após atualizar stats
    await checkAchievements()

    return { error: null }
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error)
    return { error }
  }
}

// =============================================
// SISTEMA DE MISSÕES DIÁRIAS
// =============================================

// Obter missões diárias do usuário
export async function getDailyMissions() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Primeiro, garantir que as missões diárias existem para hoje
    await createDailyMissions()

    const { data, error } = await supabase
      .from('user_missions_view')
      .select('*')
      .eq('user_id', user.id)
      .eq('date_assigned', new Date().toISOString().split('T')[0])
      .order('xp_reward', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao buscar missões diárias:', error)
    return { data: null, error }
  }
}

// Criar missões diárias se não existirem
export async function createDailyMissions() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase.rpc('create_daily_missions_for_user', {
      user_uuid: user.id
    })

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Erro ao criar missões diárias:', error)
    return { error }
  }
}

// Atualizar progresso das missões (chamado após completar hábito)
export async function updateMissionProgress() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // O trigger já atualiza automaticamente, mas vamos recompensar missões completadas
    const { error } = await supabase.rpc('reward_completed_missions')
    
    if (error && !error.message.includes('does not exist')) {
      throw error
    }
    
    return { error: null }
  } catch (error) {
    console.error('Erro ao atualizar progresso das missões:', error)
    return { error }
  }
}

// Completar missão manualmente (se necessário)
export async function completeMission(missionId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('user_missions')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', missionId)
      .eq('user_id', user.id)
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Erro ao completar missão:', error)
    return { data: null, error }
  }
}
