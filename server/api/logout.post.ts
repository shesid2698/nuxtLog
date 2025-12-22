// server/api/logout.post.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // 1. 初始化 Client
  // 注意：這裡必須能成功抓到使用者 (透過 Cookie 或 Header)
  // 因為你必須先知道「是誰」在請求，才能把他踢出系統
  const client = await serverSupabaseClient(event)

  // 2. 執行後端登出
  // 這行程式碼會做兩件事：
  // A. 向 Supabase Auth Server 發送請求，將該使用者的 Refresh Token 廢除 (Revoke)。
  // B. (視模組實作而定) 嘗試清除後端實例中的 Session 狀態。
  const { error } = await client.auth.signOut()

  // 3. 錯誤處理
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  // 4. 回傳成功訊息
  return { success: true, message: '使用者已登出，Token 已失效' }
})