<script setup lang="ts">
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
const user = useSupabaseUser();
const session = useSupabaseSession();
const name = ref<string>("");
const isShowDialog = ref(false);
const isShowProfile = ref(false);
const isShowProfileDialog = ref(false);
/**紀錄步驟 */
const currentStep = ref(1);
/**步驟一interface */
interface moodCategories {
  category: number,
  text: string,
  img: string
}
/**步驟一內容 */
const step1Content = ref<moodCategories[]>([
  {
    category: 1,
    text: "Very Happy",
    img: '/images/very_happy.svg'
  },
  {
    category: 2,
    text: "Happy",
    img: '/images/happy.svg'
  },
  {
    category: 3,
    text: "Neutral",
    img: '/images/neutral.svg'
  },
  {
    category: 4,
    text: "Sad",
    img: '/images/sad.svg'
  },
  {
    category: 5,
    text: "Very Sad",
    img: '/images/very_sad.svg'
  }
])
/**步驟二interface */
interface feelCategories {
  category: number,
  text: string
}
/**步驟二內容 */
const step2Content = ref<feelCategories[]>(
  [
    {
      category: 1,
      text: "Joyful"
    },
    {
      category: 2,
      text: "Down"
    },
    {
      category: 3,
      text: "Anxious"
    },
    {
      category: 4,
      text: "Calm"
    },
    {
      category: 5,
      text: "Excited"
    },
    {
      category: 6,
      text: "Frustrated"
    },
    {
      category: 7,
      text: "Lonely"
    },
    {
      category: 8,
      text: "Grateful"
    },
    {
      category: 9,
      text: "Overwhelmed"
    },
    {
      category: 10,
      text: "Motivated"
    },
    {
      category: 11,
      text: "Irritable"
    },
    {
      category: 12,
      text: "Peaceful"
    },
    {
      category: 13,
      text: "Tired"
    },
    {
      category: 14,
      text: "Hopeful"
    },
    {
      category: 15,
      text: "Confident"
    },
    {
      category: 16,
      text: "Stressed"
    },
    {
      category: 17,
      text: "Content"
    },
    {
      category: 18,
      text: "Disappointed"
    },
    {
      category: 19,
      text: "Optimistic"
    },
    {
      category: 20,
      text: "Restless"
    }
  ]
)
/**步驟四interface */
interface sleepCategories {
  category: number,
  text: string
}
/**步驟四內容 */
const step4Content = ref<sleepCategories[]>(
  [
    {
      category: 1,
      text: "9+ hours"
    },
    {
      category: 2,
      text: "7-8 hours"
    },
    {
      category: 3,
      text: "5-6 hours"
    },
    {
      category: 4,
      text: "3-4 hours"
    },
    {
      category: 5,
      text: "0-2 hours"
    },
  ]
)
/**log interface */
interface RequestData {
  /**心情種類 1=vary_happy;2=happy;3=neutral;4=sad;5=very_sad */
  moodCategory: number,
  feelCategories: number[],
  comment: string,
  sleepCategory: number,
  error: boolean
}
/**初始化model */
const GetInitialData = (): RequestData => ({
  moodCategory: 0,
  feelCategories: [],
  comment: '',
  sleepCategory: 0,
  error: false
});
/**log request */
const logRequestData = reactive<RequestData>(GetInitialData());
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
  }else{
    name.value = user.value.user_metadata?.display_name;
    console.log('user',user.value.user_metadata)
  }
})
onMounted(() => {
})
/**關閉Dialog，並重置資料 */
const CloseDialog = () => {
  isShowDialog.value = false;
  currentStep.value = 1;
  Object.assign(logRequestData, GetInitialData())
}
/**關閉個人資料設定彈窗 */
const CloseProfileDialog = () => {
  isShowProfileDialog.value = false;
}
/**開啟個人資料設定彈窗 */
const OpenProfileDialog = () => {
  isShowProfileDialog.value = true;
  isShowProfile.value = false;
}
/**
 * 檢查步驟
 * @param step 步驟
 */
const CheckStep = (step: number) => {
  logRequestData.error = false;
  switch (step) {
    case 1:
      if (logRequestData.moodCategory === 0) {
        logRequestData.error = true;
        return;
      }
      break;
    case 2:
      if (logRequestData.feelCategories.length === 0 || logRequestData.feelCategories.length > 3) {
        logRequestData.error = true;
        return;
      }
      break;
    case 3:
      if (logRequestData.comment.trim() === "") {
        logRequestData.error = true;
        return;
      }
      break;
    case 4:
      if (logRequestData.sleepCategory === 0) {
        logRequestData.error = true;
        return;
      }
      // 打API，如果成功就重置視窗與logRequestData
      currentStep.value = 1;
      Object.assign(logRequestData, GetInitialData());
      isShowDialog.value = false;
      return;
      break;
  }
  currentStep.value = step + 1;
}
/**登出 */
const Logout = async () => {
  var resp = await $fetch('/api/logout', {
    method: 'post'
  });
  if (resp.success) {
    console.log("成功", resp.message);
    reloadNuxtApp();
  }
}
/**取得使用者頭像 */
const GetProfilePic = computed(()=>{
  return user?.value?.user_metadata?.avatar_url || '/images/none-user.svg';
});
const UpdateUser = async()=>{
  try {
    const client = useSupabaseClient(); // 取得客戶端
    const resp = await $fetch('/api/update-users', {
      method: 'post',
      body: {
        newName: name.value
      },
      headers: {
        Authorization: `Bearer ${session?.value?.access_token}`
      }
    })
    if (resp.status.code !== 0) throw new Error(resp.status.message);
    const { data, error } = await client.auth.refreshSession();

    if (error) {
      throw new Error(error.message);
    }
    await navigateTo('/', {
      external: true
    })
  } catch (ex) {
    console.error("UpdateUser error", ex);
  }
}
</script>
<template>
  <div id="main" @click="isShowProfile = false">
    <!-- dialog -->
    <div v-if="isShowDialog"
      class="absolute w-full min-h-full bg-[rgba(33,33,77,0.7)] top-0 left-0 flex justify-center pt-80px box-border z-999">
      <div class="md:w-600px w-335px h-fit dialog-container">
        <!-- 關閉鈕 -->
        <div class="absolute top-30px right-30px h-15px w-fit cursor-[url(/images/pointer.svg),_pointer]"
          @click="CloseDialog"><img src="/images/close.svg" class="block h-100%" alt="">
        </div>
        <div class="text-Reddit text-40px font-bold text-[#21214D] tracking-[-0.3px] mb-32px">Log your mood</div>
        <!-- 進度條 -->
        <div class="flex mb-32px">
          <div v-for="index in 4" :key="index" class="mr-16px h-6px rounded-999px flex-1 last:mr-0 bg-[#C7D3F7]"
            :class="{ '!bg-[#4865DB]': currentStep >= index }"></div>
        </div>
        <!-- 步驟一 -->
        <template v-if="currentStep === 1">
          <div class="text-Reddit text-32px font-bold tracking-[-0.3px] text-[#21214D] mb-32px">How was your mood today?
          </div>
          <label v-for="item in step1Content"
            class="block px-20px py-12px box-border h-62px bg-[#ffffff] rounded-10px border-2px border-solid has-[:checked]:border-[#4865DB] border-[#E0E6FA] text-Reddit text-[#21214D] text-20px font-semibold cursor-[url(/images/pointer.svg),_pointer] flex items-center mb-12px last-of-type:mb-32px">
            <input type="radio" :value="item.category" v-model="logRequestData.moodCategory" class="hidden">
            <span
              class="w-20px h-20px box-border block rounded-999px bg-#ffffff border-1.5px border-solid border-[#C7D3F7] mr-12px"></span>
            <div class="flex-1 flex justify-between items-center">
              <div class="w-fit h-fit">{{ item.text }}</div>
              <div class="w-fit h-fit"><img :src="item.img" alt="" class="block" width="38"></div>
            </div>
          </label>
          <div v-if="logRequestData.error"
            class="flex items-center text-15px tracking-[-0.3px] text-[#E60013] text-Reddit mb-16px"><img
              src="/images/info.svg" class="block mr-6.5px" alt="">Please select a mood before
            continuing.</div>
          <div
            class="box-border px-32px py-16px bg-[#4865DB] text-white text-24px text-Reddit font-semibold rounded-10px cursor-[url(/images/pointer.svg),_pointer] text-center"
            @click="CheckStep(1)">
            Continue</div>
        </template>
        <!-- 步驟二 -->
        <template v-else-if="currentStep === 2">
          <div class="text-Reddit text-32px font-bold tracking-[-0.3px] text-[#21214D] mb-6px">How did you feel?
          </div>
          <div class="mb-32px text-18px text-[#57577B] text-Reddit font-medium">Select up to three tags:</div>
          <div class="flex flex-wrap mb-32px">
            <label v-for="item in step2Content" :key="item.category" class="bg-[#FFFFFF] box-border px-16px py-12px border-2px border-solid rounded-10px text-18px text-[#21214D] tracking-[-0.3px] flex w-fit justify-center items-center cursor-[url(/images/pointer.svg),_pointer] mr-16px mb-12px last-of-type:mr-0 transition-all
           border-[#E0E6FA] has-[:checked]:border-[#4865DB]">
              <input type="checkbox"
                :disabled="logRequestData.feelCategories.length >= 3 && logRequestData.feelCategories.indexOf(item.category) === -1"
                :value="item.category" v-model="logRequestData.feelCategories" class="hidden peer">
              <span class="w-16px h-16px border-1.5px border-solid border-[#C7D3F7] rounded-4px bg-white mr-8px flex items-center justify-center transition-all flex-shrink-0
                 peer-checked:bg-[#4865DB] peer-checked:border-[#4865DB]">
                <svg v-show="logRequestData.feelCategories.includes(item.category)"
                  class="w-14px h-14px text-white block" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span class="leading-none text-Reddit text-18px tracking-[-0.3px] text-[#21214D]">{{ item.text }}</span>
            </label>
          </div>
          <div v-if="logRequestData.error"
            class="flex items-center text-15px tracking-[-0.3px] text-[#E60013] text-Reddit mb-16px"><img
              src="/images/info.svg" class="block mr-6.5px" alt="">You can only select a maximum of 3 tags.
          </div>
          <div
            class="box-border px-32px py-16px bg-[#4865DB] text-white text-24px text-Reddit font-semibold rounded-10px cursor-[url(/images/pointer.svg),_pointer] text-center"
            @click="CheckStep(2)">
            Continue
          </div>
        </template>
        <!-- 步驟三 -->
        <template v-else-if="currentStep === 3">
          <div class="text-Reddit text-32px font-bold tracking-[-0.3px] text-[#21214D] mb-32px">Write about your day...
          </div>
          <textarea
            class="w-100% h-150px rounded-10px bg-[#ffffff] border-1px border-solid border-[#9393B7] box-border outline-none resize-none px-16px py-12px text-18px text-Reddit text-[#57577B] font-medium font-italic mb-8px overflow-y-auto [&::-webkit-scrollbar]:w-6px [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#C7D3F7] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#9393B7]"
            v-model="logRequestData.comment" maxlength="150" placeholder="Today, I felt…">
          </textarea>
          <div class="text-end text-Reddit text-13px font-semibold text-[#57577B] mb-32px">
            {{ logRequestData.comment.length }} / 150</div>
          <div v-if="logRequestData.error"
            class="flex items-center text-15px tracking-[-0.3px] text-[#E60013] text-Reddit mb-16px"><img
              src="/images/info.svg" class="block mr-6.5px" alt="">Please write a few words about your day before
            continuing.
          </div>
          <div
            class="box-border px-32px py-16px bg-[#4865DB] text-white text-24px text-Reddit font-semibold rounded-10px cursor-[url(/images/pointer.svg),_pointer] text-center"
            @click="CheckStep(3)">
            Continue
          </div>
        </template>
        <!-- 步驟四 -->
        <template v-else-if="currentStep === 4">
          <div class="text-Reddit text-32px font-bold tracking-[-0.3px] text-[#21214D] mb-32px">How many hours did you
            sleep last night?
          </div>
          <label v-for="item in step4Content"
            class="block px-20px py-12px box-border h-62px bg-[#ffffff] rounded-10px border-2px border-solid has-[:checked]:border-[#4865DB] border-[#E0E6FA] text-Reddit text-[#21214D] text-20px font-semibold cursor-[url(/images/pointer.svg),_pointer] flex items-center mb-12px last-of-type:mb-32px">
            <input type="radio" :value="item.category" v-model="logRequestData.sleepCategory" class="hidden">
            <span
              class="w-20px h-20px box-border block rounded-999px bg-#ffffff border-1.5px border-solid border-[#C7D3F7] mr-12px"></span>
            <div class="flex-1">
              <div class="w-fit h-fit">{{ item.text }}</div>
            </div>
          </label>
          <div v-if="logRequestData.error"
            class="flex items-center text-15px tracking-[-0.3px] text-[#E60013] text-Reddit mb-16px"><img
              src="/images/info.svg" class="block mr-6.5px" alt="">Please select a option before
            submit.
          </div>
          <div
            class="box-border px-32px py-16px bg-[#4865DB] text-white text-24px text-Reddit font-semibold rounded-10px cursor-[url(/images/pointer.svg),_pointer] text-center"
            @click="CheckStep(4)">
            Submit
          </div>
        </template>
      </div>
    </div>
    <!-- profile dialog -->
    <div v-if="isShowProfileDialog"
      class="absolute w-full min-h-full bg-[rgba(33,33,77,0.7)] top-0 left-0 flex justify-center pt-80px box-border z-999">
      <div class="md:w-600px w-335px h-fit dialog-container">
        <!-- 關閉鈕 -->
        <div class="absolute top-30px right-30px h-15px w-fit cursor-[url(/images/pointer.svg),_pointer]"
          @click="CloseProfileDialog"><img src="/images/close.svg" class="block h-100%" alt="">
        </div>

        <div class="text-Reddit text-32px font-bold text-[#21214D] tracking-[-0.3px] mb-32px mb-8px">Update your profile
        </div>
        <div class="text-Reddit text-18px tracking-[-0.3px] text-[#57577B] mb-32px">Personalize your account with your
          name
          and photo.</div>
        <div class="text-Reddit text-18px tracking-[-0.3px] text-[#21214D] mb-8px">Name</div>
        <input type="text"
          class="block w-100% box-border px-16px py-12px rounded-10px bg-[#FFFFFF] border-1px border-solid border-[#57577B] outline-none text-18px tracking-[-0.3px] text-Reddit text-[#21214D] mb-24px"
          v-model="name">
        <div class="flex items-start mb-32px">
          <div class="w-fit mr-20px">
            <img :src="GetProfilePic" width="68" height="68" class="rounded-999px" alt="">
          </div>
          <div>
            <div class="text-Reddit text-18px tracking-[-0.3px] text-[#21214D] mb-6px">Upload Image</div>
            <div class="text-Reddit text-15px tracking-[-0.3px] text-[#57577B] mb-16px">Max 250KB, PNG or JPEG</div>
            <label               class="box-border px-16px py-8px rounded-8px bg-white border-1px border-solid border-[#9393B7] w-fit text-Reddit text-18px text-[#21214D] cursor-[url(/images/pointer.svg),_pointer]"
              >Upload<input
                type="file" class="hidden"></label>
          </div>
        </div>
        <div
          class="box-border px-32px py-16px bg-[#4865DB] text-white text-24px text-Reddit font-semibold rounded-10px cursor-[url(/images/pointer.svg),_pointer] text-center"
          @click="UpdateUser">
          Save changes
        </div>
      </div>
    </div>
    <div class="xl:w-1170px md:w-704px w-343px box-border pt-40px">
      <!-- navbar -->
      <div class="flex justify-between mb-64px">
        <div class="flex items-center">
          <div class="mr-16px"><img src="/images/Logo_icon.svg" class="block" width="40" alt=""></div>
          <div class="text-Reddit font-bold text-21px text-[#21214D] tracking-[-0.8px]">Mood tracker</div>
        </div>
        <!-- 個人資料 -->
        <ClientOnly>
          <div v-if="user && user.user_metadata"
            class="flex items-center relative cursor-[url(/images/pointer.svg),_pointer]" @click.stop
            @click="isShowProfile = !isShowProfile">
            <div class="rounded-100% overflow-hidden mr-[8.75px]">
              <img :src="user.user_metadata.avatar_url" class="block" width="40" height="40" alt="">
            </div>
            <div><img src="/images/down.svg" width="10" alt=""></img></div>
            <!-- 個人資料選單 -->
            <div v-if="isShowProfile === true" @click.stop
              class="absolute bg-white shadow-[0_5px_8px_0_rgba(33,33,77,0.16)] md:w-200px w-343px box-border px-16px py-12px rounded-8px top-100% right-0 cursor-default">
              <div class="text-Reddit text-18px text-[#21214D] font-medium mb-2px">{{ user.user_metadata.display_name }}</div>
              <div class="text-Reddit text-15px tracking-[-0.3px] text-[#9393B7] mb-12px">{{ user.user_metadata.email }}
              </div>
              <div class="h-1px bg-[#E0E6FA] mb-12px"></div>
              <!-- 設定 -->
              <div
                class="flex w-fit items-center text-15px text-Reddit tracking-[-0.3px] text-[#21214D] mb-12px cursor-[url(/images/pointer.svg),_pointer]"
                @click="OpenProfileDialog">
                <img src="/images/setting.svg" alt="" class="mr-10px">Settings
              </div>
              <!-- 登出 -->
              <div
                class="flex w-fit items-center text-15px text-Reddit tracking-[-0.3px] text-[#21214D] cursor-[url(/images/pointer.svg),_pointer]"
                @click="Logout">
                <img src="/images/sign-out.svg" alt="" class="mr-10px">Logout
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>
    <!-- 主內容 -->
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
          class="box-border px-32px py-16px bg-[#4865DB] text-white w-fit mx-auto rounded-10px text-20px font-semibold text-Reddit cursor-[url(/images/pointer.svg),_pointer]"
          @click="isShowDialog = true">
          Log today's mood
        </div>
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
            <div class="text-Reddit md:text-32px text-28px tracking-[-0.3px] text-bold text-[#21214D] mb-32px">Mood and
              sleep trends
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
              <div class="flex-1 h-100% relative overflow-x-auto">
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

label>input[type="radio"]:checked~span {
  border: 6px solid #4865DB !important;
}
</style>
