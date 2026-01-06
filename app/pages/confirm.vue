<script setup lang="ts">
/**
 * Google 登入後的中繼站
 * 目的：將 Google 的遠端頭像抓取並轉存到 Supabase Storage，避免圖片失效且統一管理
 */
const user = useSupabaseUser()
const client = useSupabaseClient()
const session = useSupabaseSession()

const isLoading = ref(true)
const statusMsg = ref('正在驗證身分...')

// Supabase專案域名
const SUPABASE_STORAGE_URL = 'kqsnhaopagkbpppqeret.supabase.co'

watch(user, async () => {
  if (user.value && session.value) {
    try {
      const metadata = user.value.user_metadata

      // 取得使用者圖片路徑(非初次登入則抓custom_avatar、初次登入直接抓avatar_url)
      const currentAvatar = metadata?.custom_avatar || metadata?.avatar_url || ''

      // 如果路徑已經包含Supabase域名，直接跳轉
      if (currentAvatar.includes(SUPABASE_STORAGE_URL)) {
        statusMsg.value = '登入成功，跳轉中...'
        return await HandleRedirect()
      }

      // 如果沒同步過，找尋Google提供的原始圖片網址(picture或avatar_url)
      const remoteUrl = metadata?.picture || (currentAvatar.startsWith('http') ? currentAvatar : null)

      // 只有當remoteUrl 存在且不包含Supabase 域名時才執行同步
      if (remoteUrl && remoteUrl.startsWith('http') && !remoteUrl.includes(SUPABASE_STORAGE_URL)) {
        statusMsg.value = '正在同步 Google 個人資料至雲端...'

        // 抓取遠端圖片並轉為File物件
        const response = await fetch(remoteUrl)
        if (!response.ok) throw new Error('無法取得 Google 圖片')
        const blob = await response.blob()
        const fileExt = blob.type.split('/')[1] || 'png'
        const newFile = new File([blob], `avatar.${fileExt}`, { type: blob.type })

        const formData = new FormData()
        // 優先順序：自定義名稱 > 全名 > 原始名稱
        const finalName = metadata?.display_name || metadata?.full_name || metadata?.name || '新使用者'

        formData.append('newName', finalName)
        formData.append('image', newFile)

        const resp = await $fetch('/api/update-users', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${session.value.access_token}`
          }
        })

        if (resp.status.code !== 0) throw new Error(resp.status.message)

        // 強制刷新 Session，讓前端 useSupabaseUser 拿到最新更新後的 user_metadata
        await client.auth.refreshSession()
        statusMsg.value = '個人資料同步完成！'
      }
    } catch (ex: any) {
      console.error("confirm error:", ex)
    } finally {
      // 無論如何都跳轉
      await HandleRedirect()
    }
  }
}, { immediate: true })

// 統一跳轉邏輯
const HandleRedirect = async () => {
  isLoading.value = false
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
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
