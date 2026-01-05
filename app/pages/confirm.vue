<script setup lang="ts">
/**
 * Google 登入後的中繼站
 * 目的：將 Google 的遠端頭像抓取並轉存到本地伺服器，避免圖片失效且統一管理
 */
const user = useSupabaseUser()
const client = useSupabaseClient()
const session = useSupabaseSession()

// 讀取狀態控管
const isLoading = ref(true)
const statusMsg = ref('正在驗證身分...')

watch(user, async () => {
  // 必須同時確保 user 與 session 都已就緒
  if (user.value && session.value) {
    try {
      const metadata = user.value.user_metadata
      
      // 1. 取得目前存放在 metadata 的路徑
      const currentAvatar = metadata?.custom_avatar || ''
      
      // 2. 判斷邏輯：如果 avatar_url 已經是本地路徑 (/images/...)，代表已經同步過
      if (currentAvatar.startsWith('/images/')) {
        console.log("偵測到本地頭像，準備進入系統...")
        statusMsg.value = '同步完成，跳轉中...'
        return await handleRedirect()
      }

      // 3. 如果沒同步過，找尋 Google 提供的原始圖片網址
      // Google OAuth 通常存放在 picture，Supabase 可能會複製到 avatar_url
      const remoteUrl = metadata?.picture || (currentAvatar.startsWith('http') ? currentAvatar : null)

      if (remoteUrl && remoteUrl.startsWith('http')) {
        statusMsg.value = '正在同步 Google 個人資料...'
        
        // A. 抓取圖片並轉為 File 物件
        const response = await fetch(remoteUrl)
        if (!response.ok) throw new Error('無法取得 Google 圖片')
        const blob = await response.blob()
        const newFile = new File([blob], "avatar.png", { type: blob.type })

        // B. 準備傳送資料
        const formData = new FormData()
        const finalName = metadata?.full_name || metadata?.name || metadata?.display_name || '新使用者'
        
        formData.append('newName', finalName)
        formData.append('image', newFile)

        // C. 呼叫後端 API 執行轉存與資料庫更新
        const resp = await $fetch('/api/update-users', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${session.value.access_token}`
          }
        })

        if (resp.status.code !== 0) throw new Error(resp.status.message)

        // D. 重點：強制刷新 Session，讓前端 useSupabaseUser 拿到最新的本地 avatar_url
        await client.auth.refreshSession()
        statusMsg.value = '同步成功！'
      }

    } catch (ex: any) {
      console.error("中繼站處理失敗:", ex)
      // 這裡不阻斷流程，讓使用者依然能進入系統
    } finally {
      await handleRedirect()
    }
  }
}, { immediate: true })

// 統一跳轉邏輯
const handleRedirect = async () => {
  isLoading.value = false
  // 使用 external: true 確保狀態完全重置，避免 Hydration 錯誤
  await navigateTo('/', { external: true })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
    <div class="p-8 bg-white rounded-2xl shadow-sm flex flex-col items-center">
      <div class="w-12 h-12 border-4 border-[#3CAADC]/20 border-t-[#3CAADC] rounded-full animate-spin mb-4"></div>
      
      <h2 class="text-xl font-bold text-[#21214D] mb-2">
        {{ isLoading ? '登入成功' : '即將完成' }}
      </h2>
      <p class="text-gray-500">{{ statusMsg }}</p>
    </div>
  </div>
</template>