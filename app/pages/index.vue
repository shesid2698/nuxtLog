<script setup lang="ts">
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
const user = useSupabaseUser()
const session = useSupabaseSession();
// const { data: posts, error } = await useFetch('/api/get-posts', {
//   method: 'POST',
//   headers: {
//     Authorization: session.value?.access_token ? session.value.access_token : ''
//   },

//   // 只有 user 存在時才發請求
//   immediate: !!user.value,

//   // 當 user 或 session 改變時，自動重新發送 API
//   watch: [user, session]
// })
// 一開始會跑一次，之後如果 user 狀態改變也會跑
watchEffect(() => {
  if (!user.value) {
    return navigateTo("/sign-up")
  }
})
onMounted(() => {
})
</script>
<template>
  <div id="main">
    <div class="xl:w-1170px md:w-704px w-343px box-border pt-40px">
      <!-- navbar -->
      <div class="flex justify-between mb-64px">
        <div class="flex items-center">
          <div class="mr-16px"><img src="/images/Logo_icon.svg" class="block" width="40" alt=""></div>
          <div class="text-Reddit font-bold text-21px text-[#21214D] tracking-[-0.8px]">Mood tracker</div>
        </div>
        <ClientOnly>
          <div v-if="user && user.user_metadata" class="flex items-center">
            <div class="rounded-100% overflow-hidden mr-[8.75px]">
              <img :src="user.user_metadata.avatar_url" class="block" width="40" height="40" alt="">
            </div>
            <div><img src="/images/down.svg" width="10" alt=""></img></div>
          </div>
        </ClientOnly>
      </div>
      <div class="xl:w-656px md:w-704px w-343px mx-auto text-center">
        <div v-if="user && user.user_metadata"
          class="text-Reddit md:text-32px text-24px font-bold text-[#4865DB] tracking-[-0.3px]  mb-10px">Hello,
          {{ user.user_metadata.full_name }}!</div>
        <div class="md:text-52px text-46px font-bold text-Reddit tracking-[-2px] text-[#21214D] mb-10px">How are you
          feeling today?
        </div>
        <div class="text-18px font-medium text-Reddit text-[#57577B] mb-64px">{{ dayjs().format('dddd, MMMM Do, YYYY')
          }}
        </div>
        <div
          class="box-border px-32px py-16px bg-[#4865DB] text-white w-fit mx-auto rounded-10px text-20px font-semibold text-Reddit cursor-pointer">
          Log today's mood</div>
      </div>
    </div>
    <!-- <ClientOnly>
            <template v-if="user && user.user_metadata">
                <p>Name:{{ user.user_metadata.full_name }}</p>
                <div class="w-2% overflow-hidden rounded-50%"><img :src="user.user_metadata.avatar_url" class="block"
                        width="100%" alt=""></div>
            </template>
</ClientOnly> -->
  </div>
</template>
<style scoped>
#main {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: linear-gradient(180deg, #F5F5FF 73%, #E0E0FF 100%);
}

.text-Reddit {
  font-family: 'Reddit Sans', sans-serif;
}
</style>
