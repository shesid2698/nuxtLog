// server/api/get-posts.post.ts
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // 1. 讀取環境變數
  const myUrl: string = process.env.SUPABASE_URL!
  const myKey: string = process.env.SUPABASE_KEY!// Anon Key

  // 先檢查是否存在
  if (!myUrl || !myKey) {
    throw new Error('❌ 環境變數缺失，請檢查 .env 檔案')
  }

  // 2. 讀取 Header 裡的 Token
  const authHeader = getRequestHeader(event, 'Authorization')

  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: '未授權：請帶上 Token' })
  }

  // 3. 【關鍵修改】直接建立一個「已登入」的 Client
  // 我們透過 global.headers 強制把 Token 塞給這個 Client
  // 這樣它發出的所有請求，都會以此身分進行，RLS 就會生效！
  const authenticatedClient = createClient(myUrl, myKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authHeader}`
      }
    },
    auth: {
      persistSession: false // Server 端不需要持久化 Session
    }
  })

  // 5. 執行查詢 (使用這個帶有 Token 的 Client)
  // RLS 規則 (auth.uid() = user.id) 在這裡會生效
  const { data, error } = await authenticatedClient
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return data
})