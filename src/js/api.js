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
