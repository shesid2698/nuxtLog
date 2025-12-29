<script setup lang="ts">
const user = useSupabaseUser()
const session = useSupabaseSession();
const { data: posts, error } = await useFetch('/api/get-posts', {
    method: 'POST',
    headers: {
        Authorization: session.value?.access_token ? session.value.access_token : ''
    },

    // 只有 user 存在時才發請求
    immediate: !!user.value,

    // 當 user 或 session 改變時，自動重新發送 API
    watch: [user, session]
})
// 一開始會跑一次，之後如果 user 狀態改變也會跑
watchEffect(() => {
    if (!user.value) {
        return navigateTo("/sign-up")
    }
})
onMounted(() => {
    console.log('posts',posts);
})
</script>
<template>
    <div>
        <h1>Index Page</h1>
        <ClientOnly>
            <template v-if="user && user.user_metadata">
                <p>Name:{{ user.user_metadata.full_name }}</p>
                <div class="w-2% overflow-hidden rounded-50%"><img :src="user.user_metadata.avatar_url" class="block"
                        width="100%" alt=""></div>
            </template>
        </ClientOnly>
    </div>
</template>