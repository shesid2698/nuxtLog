<script setup lang="ts">
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
const user = useSupabaseUser()
const isShowDialog = ref(false);
// const session = useSupabaseSession();
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
    <div v-if="isShowDialog"
      class="absolute w-full h-full bg-[rgba(33,33,77,0.7)] top-0 left-0 flex justify-center pt-80px box-border z-999">
      <div class="w-600px h-747px dialog-container">
        <!-- 關閉鈕 -->
        <div class="absolute top-30px right-30px h-15px w-fit cursor-pointer" @click="isShowDialog = false"><img
            src="/images/close.svg" class="block h-100%" alt="">
        </div>
        <div class="text-Reddit text-40px font-bold text-[#21214D] tracking-[-0.3px]">Log your mood</div>
      </div>
    </div>
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
    </div>
    <div class="w-100%">
      <div class="xl:w-656px md:w-704px w-343px mx-auto text-center mb-64px">
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
          class="box-border px-32px py-16px bg-[#4865DB] text-white w-fit mx-auto rounded-10px text-20px font-semibold text-Reddit cursor-pointer"
          @click="isShowDialog = true">
          Log today's mood</div>
      </div>
      <div class="flex xl:flex-row flex-col xl:justify-center justify-normal xl:items-start items-center">
        <!-- 左邊區域 -->
        <div
          class="xl:w-370px md:w-704px w-343px bg-[#FFFFFF] box-border p-24px rounded-16px border-1px border-solid border-[#E0E6FA] xl:mr-32px mr-0 xl:mb-0 mb-32px">
          <!-- title1 -->
          <div class="mb-12px">
            <span class="text-Reddit text-20px font-semibold text-[#21214D]">Average Mood</span>
            <span class="text-Reddit text-15px tracking-[-0.3px] text-[#57577B]"> (Last 5 Check-ins)</span>
          </div>
          <!-- 資訊卡1 -->
          <div class="w-100% box-border px-20px py-41.75px rounded-16px bg-[#E0E6FA] relative overflow-hidden mb-24px">
            <div class="text-24px text-Reddit font-semibold text-[#21214D] mb-12px">Keep tracking! </div>
            <div class="text-Reddit text-15px tracking-[-0.3px] text-[#21214D]">Log 5 check-ins to see your average
              mood.</div>
            <div
              class="absolute w-221px aspect-ratio-[1/1] bg-[rgba(255,255,255,0.2)] rounded-100% xl:left-122% left-122% md:left-110% top-0 transform-translate-x-[-50%]">
            </div>
            <div
              class="absolute w-221px aspect-ratio-[1/1] bg-[rgba(255,255,255,0.2)] rounded-100% xl:left-115% md:left-106% left-115% top-50% transform-translate-y-[-50%] transform-translate-x-[-50%]">
            </div>
          </div>
          <!-- title2 -->
          <div class="mb-16px">
            <span class="text-Reddit text-20px font-semibold text-[#21214D]">Average Sleep</span>
            <span class="text-Reddit text-15px tracking-[-0.3px] text-[#57577B]"> (Last 5 Check-ins)</span>
          </div>
          <!-- 資訊卡2 -->
          <div class="w-100% box-border px-20px py-41.75px rounded-16px bg-[#E0E6FA] relative overflow-hidden">
            <div class="text-24px text-Reddit font-semibold text-[#21214D] mb-12px">Not enough data yet!</div>
            <div class="text-Reddit text-15px tracking-[-0.3px] text-[#21214D]">Track 5 nights to view average sleep.
            </div>
            <div
              class="absolute w-221px aspect-ratio-[1/1] bg-[rgba(255,255,255,0.2)] rounded-100% xl:left-122% left-122% md:left-110% top-0 transform-translate-x-[-50%]">
            </div>
            <div
              class="absolute w-221px aspect-ratio-[1/1] bg-[rgba(255,255,255,0.2)] rounded-100% xl:left-115% md:left-106% left-115% top-50% transform-translate-y-[-50%] transform-translate-x-[-50%]">
            </div>
          </div>
        </div>
        <!-- 右邊區域 -->
        <div>
          <div
            class="bg-[#FFFFFF] xl:w-768px md:w-704px w-343px rounded-16px box-border md:px-24px md:py-24px px-16px py-20px  border-1px border-solid border-[#E0E6FA]">
            <div class="text-Reddit md:text-32px text-28px tracking-[-0.3px] text-bold text-[#21214D] mb-32px">Mood and sleep trends
            </div>
            <div class="h-312px flex overflow-hidden">
              <!-- 左邊 -->
              <div class="w-fit h-100% text-12px text-Reddit text-[#57577B]">
                <div class="h-15% content-center"><img src="/images/sleep_icon.svg" class="w-9px mr-6px" alt="">9+ hours
                </div>
                <div class="h-15% content-center"><img src="/images/sleep_icon.svg" class="w-9px mr-6px" alt="">7-8
                  hours</div>
                <div class="h-15% content-center"><img src="/images/sleep_icon.svg" class="w-9px mr-6px" alt="">5-6
                  hours</div>
                <div class="h-15% content-center"><img src="/images/sleep_icon.svg" class="w-9px mr-6px" alt="">3-4
                  hours</div>
                <div class="h-15% content-center"><img src="/images/sleep_icon.svg" class="w-9px mr-6px" alt="">0-2
                  hours</div>
              </div>
              <!-- 右邊 -->
              <div class="xl:w-626px md:w-572px w-227px h-100% relative overflow-x-auto">
                <div class="h-15% content-center">
                  <div class="w-95% h-1px line my-0 mx-auto"></div>
                </div>
                <div class="h-15% content-center">
                  <div class="w-95% h-1px line my-0 mx-auto"></div>
                </div>
                <div class="h-15% content-center">
                  <div class="w-95% h-1px line my-0 mx-auto"></div>
                </div>
                <div class="h-15% content-center">
                  <div class="w-95% h-1px line my-0 mx-auto"></div>
                </div>
                <div class="h-15% content-center">
                  <div class="w-95% h-1px line my-0 mx-auto"></div>
                </div>
                <div class="absolute w-95% h-85% top-0 left-50% transform-translate-x-[-50%] flex items-end">
                  <div class="!w-42px shrink-0 mr-16px h-55.6% bg-[#FFC97C] box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/very_happy_white.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-38% bg-[#89E780] box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/happy_white.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-20.3% bg-[#89CAFF] box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/neutral_white.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-73.3% bg-[#B8B1FF] box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/sad_white.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-91% bg-[#FF9B99] box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/very_sad_white.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-91% bg-blue box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/very_happy.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-91% bg-blue box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/very_happy.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-91% bg-blue box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/very_happy.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-91% bg-blue box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/very_happy.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-91% bg-blue box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/very_happy.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-91% bg-blue box-border p-5px rounded-999px">
                    <div class="w-full aspect-[1/1] rounded-999px"><img src="/images/very_happy.svg" alt=""
                        class="block w-100%"></div>
                  </div>
                </div>
                <div class="absolute w-95% h-15% bottom-0 left-50% transform-translate-x-[-50%] flex">
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                  <div class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">March</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">31</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

</template>
<style scoped>
#main {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: linear-gradient(180deg, #F5F5FF 73%, #E0E0FF 100%);
}

.text-Reddit {
  font-family: 'Reddit Sans', sans-serif;
}

.line {
  border: 0 solid rgb(255, 253, 253);
  border-bottom-width: 1px;
}

.dialog-container {
  position: relative;
  padding: 48px 40px;
  box-sizing: border-box;
  border-radius: 16px;
  background: linear-gradient(to bottom, #F5F5FF 73%, #E0E0FF 100%);
}
</style>
