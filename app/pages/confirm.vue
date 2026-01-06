<script setup lang="ts">
/**
 * Google 登入後的中繼站
 * 目的：將 Google 的遠端頭像抓取並轉存到 Supabase Storage，避免圖片失效且統一管理
 */
const user = useSupabaseUser()
const client = useSupabaseClient()
const session = useSupabaseSession()

// 讀取狀態控管
const isLoading = ref(true)
const statusMsg = ref('正在驗證身分...')

// *** 請確保這裡換成你自己的 Supabase 專案域名 ***
const SUPABASE_STORAGE_URL = 'kqsnhaopagkbpppqeret.supabase.co'

watch(user, async () => {
  // 必須同時確保 user 與 session 都已就緒
  if (user.value && session.value) {
    try {
      const metadata = user.value.user_metadata

      // 1. 取得目前存放在 metadata 的路徑 (優先讀取 custom_avatar)
      const currentAvatar = metadata?.custom_avatar || metadata?.avatar_url || ''

      // 2. 判斷邏輯：如果路徑已經包含 Supabase 域名，代表已經同步過，直接進入系統
      if (currentAvatar.includes(SUPABASE_STORAGE_URL)) {
        console.log("偵測到雲端頭像，準備進入系統...")
        statusMsg.value = '登入成功，跳轉中...'
        return await handleRedirect()
      }

      // 3. 如果沒同步過，找尋 Google 提供的原始圖片網址 (通常在 picture 或 avatar_url)
      const remoteUrl = metadata?.picture || (currentAvatar.startsWith('http') ? currentAvatar : null)

      // 4. 只有當 remoteUrl 存在且「不包含」Supabase 域名時才執行同步
      if (remoteUrl && remoteUrl.startsWith('http') && !remoteUrl.includes(SUPABASE_STORAGE_URL)) {
        statusMsg.value = '正在同步 Google 個人資料至雲端...'

        // A. 抓取遠端圖片並轉為 File 物件
        const response = await fetch(remoteUrl)
        if (!response.ok) throw new Error('無法取得 Google 圖片')
        const blob = await response.blob()

        // 根據檔案類型決定副檔名，預設為 png
        const fileExt = blob.type.split('/')[1] || 'png'
        const newFile = new File([blob], `avatar.${fileExt}`, { type: blob.type })

        // B. 準備傳送資料給 API
        const formData = new FormData()
        // 優先順序：自定義名稱 > 全名 > 原始名稱
        const finalName = metadata?.display_name || metadata?.full_name || metadata?.name || '新使用者'

        formData.append('newName', finalName)
        formData.append('image', newFile)

        // C. 呼叫後端 API 執行轉存與資料庫更新 (該 API 現在會將圖片傳至 Storage)
        const resp = await $fetch('/api/update-users', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${session.value.access_token}`
          }
        })

        if (resp.status.code !== 0) throw new Error(resp.status.message)

        // D. 重要：強制刷新 Session，讓前端 useSupabaseUser 拿到最新更新後的 user_metadata
        await client.auth.refreshSession()
        statusMsg.value = '個人資料同步完成！'
      }

    } catch (ex: any) {
      console.error("中繼站同步處理失敗:", ex)
      // 即使同步失敗，也不要讓使用者卡死在這裡，依然嘗試跳轉
    } finally {
      await handleRedirect()
    }
  }
}, { immediate: true })

// 統一跳轉邏輯
const handleRedirect = async () => {
  isLoading.value = false
  // 使用 external: true 確保狀態完全重置，進入主頁面
  await navigateTo('/', { external: true })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
    <div class="p-8 bg-white rounded-2xl shadow-sm flex flex-col items-center">
      <div class="w-12 h-12 border-4 border-[#3CAADC]/20 border-t-[#3CAADC] rounded-full animate-spin mb-4"></div>

      <h2 class="text-xl font-bold text-[#21214D] mb-2">
        {{ isLoading ? '驗證中' : '即將完成' }}
      </h2>
      <p class="text-gray-500">{{ statusMsg }}</p>
    </div>
  </div>
</template>

<style scoped>
/* 這裡可以依據你的專案風格調整樣式 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
