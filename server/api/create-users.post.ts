import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    // 1. 取得前端(或 Postman) 傳來的資料
    const body = await readBody(event)
    const { email, password, name,nickname } = body
    // 檢查必要欄位
    if (!email || !password || !name || !nickname) {
        throw createError({
            statusCode: 400,
            statusMessage: '缺少必要欄位: email, password, name, nickname',
        })
    }

    // 2. 初始化 Supabase Client
    // 注意：這裡即使沒登入也能用，因為 signUp 本來就是給匿名用的
    const client = await serverSupabaseClient(event)

    // 3. 執行註冊 (這會寫入 auth.users)
    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            // 這裡就是觸發 SQL Trigger 的關鍵！
            // 我們把 name 塞在 metadata 傳給資料庫
            data: {
                name:name,
                role:'admin',
                nickname:nickname
            },
        },
    })

    // 4. 錯誤處理
    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: error.message,
        })
    }

    // 5. 回傳成功訊息
    return {
        success: true,
        message: '註冊成功！Trigger 應該已經自動建立 Member 資料了。',
        user: data.user,
    }
})