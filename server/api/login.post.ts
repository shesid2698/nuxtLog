// server/api/auth/login.post.ts
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const MY_URL = "https://kqsnhaopagkbpppqeret.supabase.co"
    const MY_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxc25oYW9wYWdrYnBwcHFlcmV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM0ODc2NCwiZXhwIjoyMDgwOTI0NzY0fQ.-xOLTzMbpoUrzvInGSeR3Y6F9tWlIi9UL-OUC06mXuw" // 你的 Service Key

    // ==========================================
    // Client A: 驗證專用 (用完即丟)
    // ==========================================
    // 這隻 Client 的任務只有一個：確認密碼對不對
    // 雖然它一開始有 Service Key，但登入後它會變成 User 身分 (沒差，我們只要 Token)
    const authClient = createClient(MY_URL, MY_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
        email: 'sidebar33@gmail.com',
        password: 'tony22585165'
    })

    if (authError) throw createError({ statusCode: 401, statusMessage: '登入失敗' })

    // ==========================================
    // Client B: 資料庫專用 (永遠保持上帝身分)
    // ==========================================
    // ⚠️ 絕對！絕對！不要拿這隻去呼叫 signInWithPassword
    // 它必須保持純淨，才能無視 RLS 撈資料
    const dbClient = createClient(MY_URL, MY_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    console.log('🔥 正在嘗試撈取 member 資料 (使用純淨的 Service Client)...')
    
    // 這裡我們直接用剛剛登入拿到的 ID 來查
    const targetUuid = authData.user.id
    
    const { data: memberData, error: listError } = await dbClient
        .from('member')
        .select('*')
        .eq('user_id', targetUuid) // 精準打擊
        .single()

    if (listError) {
        console.error('❌ 撈取失敗:', listError)
        return { error: listError }
    }

    return {
        success: true,
        message: "成功登入並撈到資料",
        token: authData.session.access_token,
        member: memberData
    }
})