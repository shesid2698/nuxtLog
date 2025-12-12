import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // 1. 初始化 Server 端的 Supabase Client
  // 這個 client 會自動讀取前端傳來的 Cookie，所以它知道「現在是誰在請求」
  // 因此，你在資料庫設定的 RLS (Row Level Security) 依然有效！
  const client = await serverSupabaseClient(event)

  // 2. 執行資料庫查詢
  const { data, error } = await client
    .from('posts')
    .select('*')
    // 如果你有做關聯，也可以寫 .select('*, users(email)')
    .order('created_at', { ascending: false })

  // 3. 錯誤處理 (回傳給前端)
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
  console.log("success",data);

  // 4. 回傳資料 (Nuxt 會自動轉成 JSON)
  return data
})