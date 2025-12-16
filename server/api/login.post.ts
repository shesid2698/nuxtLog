// 直接引用模組提供的兩個 Helper
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { account, password } = body

    // 1. 【左手：負責登入】
    // serverSupabaseClient 自動使用 SUPABASE_KEY (Anon)
    // 用它來驗證帳密，安全又符合規範
    const authClient = await serverSupabaseClient(event)

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
        email: account, // 你的虛擬 Email 邏輯
        password
    })

    if (authError) {
        throw createError({ statusCode: 401, statusMessage: '登入失敗' })
    }

    // 2. 【右手：負責撈資料】
    // serverSupabaseServiceRole 自動使用 SUPABASE_SERVICE_KEY (Service Role)
    // 注意：我們沒有用這隻 Client 去登入，所以它依然是上帝，可以無視 RLS
    const adminClient = serverSupabaseServiceRole(event)

    const { data: memberData, error: memberError } = await adminClient
        .from('member')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

    if (memberError) {
        console.error('Member 撈取失敗:', memberError)
        // 即使撈不到 Member，Token 還是有效的，看你要不要報錯
    }

    return {
        success: true,
        token: authData.session.access_token,
        member: memberData
    }
})