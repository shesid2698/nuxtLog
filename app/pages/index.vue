<script setup lang="ts">
const user = useSupabaseUser()

// 觀察 Console，應該會印出你的 Google Email 和大頭貼
watchEffect(() => {
    if (user.value) {
        console.log('登入者資料：', user.value)
        console.log('Email:', user.value.email)
    }
})
</script>
<template>
    <div>
        <h1>Index Page</h1>
        <ClientOnly>
            <template v-if="user && user.user_metadata">
                <p>Name:{{ user.user_metadata.full_name }}</p>
                <div class="w-2% overflow-hidden rounded-50%"><img :src="user.user_metadata.avatar_url" class="block" width="100%" alt=""></div>
            </template>
        </ClientOnly>
    </div>
</template>