<script setup lang="ts">
const user = useSupabaseUser()

watch(user, () => {
  if (user.value) {
    // 登入成功，轉跳回首頁
    return navigateTo('/')
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <p>正在登入中...請稍候 🚀</p>
  </div>
</template>
