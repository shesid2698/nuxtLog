<script setup lang="ts">
const user = useSupabaseUser()

// 監聽 User 狀態
// 一旦 Supabase 偵測到 URL 裡的 Code 並換到 Token，user 就會有值
watch(user, () => {
  if (user.value) {
    // 登入成功，轉跳回首頁或儀表板
    return navigateTo('/sign-up')
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <p>正在登入中...請稍候 🚀</p>
  </div>
</template>