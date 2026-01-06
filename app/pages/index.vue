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
/**用來儲存檔案物件 */
const selectedFile = ref<File | null>(null);
/**用來預覽上船的圖片 */
const previewUrl = ref('');
/**紀錄步驟 */
const currentStep = ref(1);
/**長條圖每筆資料interface */
interface DataUiProps {
  bg: string,
  h: string,
  src: string
}
interface DataUiDateProps {
  month: string,
  day: string
}
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
  text: string,
  value: string
}
/**步驟四內容 */
const step4Content = ref<sleepCategories[]>(
  [
    {
      category: 1,
      text: "9+ hours",
      value: "h-91%"
    },
    {
      category: 2,
      text: "7-8 hours",
      value: "h-73.3%"
    },
    {
      category: 3,
      text: "5-6 hours",
      value: "h-55.6%"
    },
    {
      category: 4,
      text: "3-4 hours",
      value: "h-38%"
    },
    {
      category: 5,
      text: "0-2 hours",
      value: "h-20.3%"
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
/**log response interface */
interface ResponseData {
  id: number,
  user_id: string,
  mood_category: number,
  feel_category: string,
  about: string,
  sleep_category: number,
  created_at: string
}
/**初始化response model */
const GetInitialResponseData = (): ResponseData => ({
  id: 0,
  user_id: "",
  mood_category: 0,
  feel_category: "",
  about: "",
  sleep_category: 0,
  created_at: ""
});
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
/**所有log資料 */
const allLogData = ref<ResponseData[]>([]);
watchEffect(async () => {
  if (!user.value) {
    return navigateTo("/sign-up")
  } else {
    name.value = user.value.user_metadata?.display_name;
    if (session?.value) {
      try {
        const resp = await $fetch('/api/get-mood', {
          method: 'post',
          headers: {
            Authorization: `Bearer ${session?.value?.access_token}`
          }
        });
        if (resp.status.code !== 0) throw new Error(resp.status.message);
        allLogData.value = resp.data;
      } catch (ex) {
        console.error("Get mood error", ex);
      }
    }
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
const CheckStep = async (step: number) => {
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
      try {
        const resp = await $fetch('/api/create-mood', {
          method: 'post',
          body: {
            moodCategory: logRequestData.moodCategory,
            feelCategories: logRequestData.feelCategories,
            comment: logRequestData.comment,
            sleepCategory: logRequestData.sleepCategory,
          },
          headers: {
            Authorization: `Bearer ${session?.value?.access_token}`
          }
        });
        if (resp.status.code !== 0) throw new Error(resp.status.message);
        const resultData = resp?.data;
        if (!resultData) throw new Error("異常..資料為空");
        currentStep.value = 1;
        Object.assign(logRequestData, GetInitialData());
        isShowDialog.value = false;
        if (resultData && !allLogData.value.some(item => item.id === resultData.id)) {
          allLogData.value.push(resultData);
        }
        return;
      } catch (ex) {
        console.error("Create mood error", ex);
      }
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
const GetProfilePic = computed(() => {
  return previewUrl.value || user?.value?.user_metadata?.custom_avatar || '/images/default_profile.svg';
});
/**更新使用者資料 */
const UpdateUser = async () => {
  try {
    const client = useSupabaseClient();

    // --- 關鍵修改：使用 FormData ---
    const formData = new FormData();
    formData.append('newName', name.value); // 傳送名字

    if (selectedFile.value) {
      formData.append('image', selectedFile.value); // 傳送圖片檔案，對應後端的 item.name === 'image'
    }

    const resp = await $fetch('/api/update-users', {
      method: 'POST',
      body: formData, // 直接把 formData 丟進去
      headers: {
        // 注意：傳送 FormData 時，不要手動寫 'Content-Type': 'multipart/form-data'，
        // 讓瀏覽器自動生成，否則會噴 boundary 錯誤。
        Authorization: `Bearer ${session?.value?.access_token}`
      }
    });

    if (resp.status.code !== 0) throw new Error(resp.status.message);

    // 重新取得 Session 以更新畫面上的 user_metadata
    const { error } = await client.auth.refreshSession();
    if (error) throw new Error(error.message);

    // 成功後跳轉
    await navigateTo('/', { external: true });

  } catch (ex: any) {
    console.error("UpdateUser error", ex);
    alert(ex.message); // 給使用者一點回饋
  }
};
/**圖片上傳事件 */
const HandleFileChange = (e: Event) => {
  try {
    const eventTarget = e.target as HTMLInputElement;
    if (eventTarget.files === null || eventTarget.files.length === 0) throw new Error("檔案上傳異常");
    const file = eventTarget?.files[0] || null;
    if (!file) throw new Error("檔案為空");

    selectedFile.value = file;
    // 產生預覽圖 (非必填，但對使用者體驗好)
    previewUrl.value = URL.createObjectURL(file);

  } catch (ex: any) {
    console.error(`HandleFileChange error..${ex.message}`);
  }

}
/**今日資料 */
const todayLogData = computed((): ResponseData => {
  // 在 allLogData 中尋找 created_at 與今天相同的資料
  let _mResponseData = allLogData.value.find(x =>
    dayjs(x.created_at).isSame(dayjs(), 'day')
  ) || null;
  return _mResponseData || GetInitialResponseData();
});
/**取得本日心情svg  */
const GetMoodPic = (moodCategory: number): string => {
  return moodCategory === 0 || moodCategory === 1 ? "/images/very_happy.svg" :
    moodCategory === 2 ? "/images/happy.svg" :
      moodCategory === 3 ? "/images/neutral.svg" :
        moodCategory === 4 ? "/images/sad.svg" : "/images/very_sad.svg";
}
/** "感覺字串"轉陣列 */
const TurnFeelCategories = (strFeelCategories: string): feelCategories[] => {
  // --- 新增防呆判斷 ---
  if (!strFeelCategories || strFeelCategories.trim() === "") {
    return [];
  }

  try {
    const feelCategories = JSON.parse(strFeelCategories) as number[];

    if (!Array.isArray(feelCategories) || feelCategories.length === 0) {
      return [];
    }

    return step2Content.value?.filter(x =>
      feelCategories.includes(x.category)
    ) ?? [];
  } catch (error) {
    // 如果 JSON 格式還是不對（例如資料庫存了髒資料），至少不會讓整個 App 壞掉
    console.error("解析 feel_category 失敗:", error);
    return [];
  }
}
/**取得每筆資料屬性 */
const GetEachDataProps = (mood_category: number, sleep_category: number): DataUiProps => {
  let eachData: DataUiProps = {
    bg: "",
    h: "",
    src: ""
  };
  switch (mood_category) {
    case 1:
      eachData.bg = "bg-[#FFC97C]";
      eachData.src = "/images/very_happy_white.svg";
      break;
    case 2:
      eachData.bg = "bg-[#89E780]";
      eachData.src = "/images/happy_white.svg";
      break;
    case 3:
      eachData.bg = "bg-[#89CAFF]";
      eachData.src = "/images/neutral_white.svg";
      break;
    case 4:
      eachData.bg = "bg-[#B8B1FF]";
      eachData.src = "/images/sad_white.svg";
      break;
    case 5:
      eachData.bg = "bg-[#FF9B99]";
      eachData.src = "/images/very_sad_white.svg";
      break;
  }
  switch (sleep_category) {
    case 1:
      eachData.h = "h-91%";
      break;
    case 2:
      eachData.h = "h-73.3%";
      break;
    case 3:
      eachData.h = "h-55.6%";
      break;
    case 4:
      eachData.h = "h-38%";
      break;
    case 5:
      eachData.h = "h-20.3%";
      break;
  }
  return eachData;
}
/**轉換每筆長條圖資料顏色 */
const GetEachBarData = (allData: ResponseData[]): DataUiProps[] => {
  let barData: DataUiProps[] = [];
  allData.forEach(x => {
    const eachData = GetEachDataProps(x.mood_category, x.sleep_category);
    barData.push(eachData);
  });
  return barData;
}
/**轉換每筆長條圖資料日期格式 */
const GetMonthStr = (allData: ResponseData[]): DataUiDateProps[] => {
  let resultData: DataUiDateProps[] = [];
  allData.forEach(x => {
    let eachData: DataUiDateProps = {
      month: "",
      day: ""
    }
    eachData.month = dayjs(x.created_at).format('MMMM');
    eachData.day = dayjs(x.created_at).format('D');
    resultData.push(eachData);
  });
  return resultData;
}
/**統計平均5筆 */
const GetLast5AverageData = computed(() => {
  if (allLogData.value.length < 5) return null;
  let averData = {
    moodCategory: 0,
    sleepCategory: 0
  }
  const moodCounts = allLogData.value.slice(-5).reduce((item, cur) => {
    item[cur.mood_category] = (item[cur.mood_category] || 0) + 1;
    return item;
  }, {} as Record<number, number>);
  allLogData.value.slice(-5).forEach(x=>{
    averData.sleepCategory+=x.sleep_category;
  })
  averData.sleepCategory =Math.round(averData.sleepCategory/5);
  const mostFrequentKey = Object.keys(moodCounts).reduce((a, b) =>
    (moodCounts[Number(a)] ?? 0) > (moodCounts[Number(b)] ?? 0) ? a : b
  );
  averData.moodCategory = Number(mostFrequentKey);

  return averData;
});
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
            <label
              class="box-border px-16px py-8px rounded-8px bg-white border-1px border-solid border-[#9393B7] w-fit text-Reddit text-18px text-[#21214D] cursor-[url(/images/pointer.svg),_pointer]">Upload<input
                type="file" class="hidden" accept="image/*" @change="HandleFileChange"></label>
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
              <img :src="user.user_metadata.custom_avatar || '/images/default_profile.svg'" class="block" width="40" height="40" alt="">
            </div>
            <div><img src="/images/down.svg" width="10" alt=""></img></div>
            <!-- 個人資料選單 -->
            <div v-if="isShowProfile === true" @click.stop
              class="absolute bg-white shadow-[0_5px_8px_0_rgba(33,33,77,0.16)] md:w-200px w-343px box-border px-16px py-12px rounded-8px top-100% right-0 cursor-default">
              <div class="text-Reddit text-18px text-[#21214D] font-medium mb-2px">{{ user.user_metadata.display_name }}
              </div>
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

      </div>
      <div v-if="todayLogData.user_id === ''"
        class="box-border px-32px py-16px bg-[#4865DB] text-white w-fit mx-auto rounded-10px text-20px font-semibold text-Reddit cursor-[url(/images/pointer.svg),_pointer] xl:mb-64px mb-48px"
        @click="isShowDialog = true">
        Log today's mood
      </div>
      <div v-else class="w-100% mb-32px flex xl:flex-row flex-col justify-center">
        <!-- 左邊區域 -->
        <div
          class="relative overflow-hidden xl:w-670px w-95% md:h-340px box-border md:p-32px px-16px py-32px rounded-16px bg-white border-1px border-solid border-[#E0E6FA] mx-auto xl:mr-32px xl:ml-0 text-Reddit flex flex-col justify-between items-center md:items-unset mb-20px xl:mb-0">
          <div>
            <div class="text-center md:text-start text-32px tracking-[-0.3px] font-bold text-[rgba(33,33,77,0.7)]">I’m
              feeling</div>
            <div class="text-center md:text-start text-40px tracking-[-0.3px] font-bold text-[#21214D] mb-32px md:mb-0">
              {{
                todayLogData.mood_category === 1 ?
                  "Very Happy" :
                  todayLogData.mood_category === 2 ? "Happy" :
                    todayLogData.mood_category === 3 ? "Neutral" :
                      todayLogData.mood_category === 4 ? "Sad" : "Very Sad" }}</div>
            <div class="md:w-320px w-200px md:h-320px h-200px md:absolute right-40px top-50px mb-32px md:mb-0">
              <img :src="GetMoodPic(todayLogData.mood_category)" class="block w-100%" alt="">
            </div>
          </div>
          <div class="md:w-246px flex flex-col items-center md:items-unset">
            <div class="xl:w-24px mb-12px">
              <img src="/images/quote_icon.svg" class="block w-4" alt="">
            </div>
            <div class="text-center md:text-start text-18px font-italic text-[#21214D] font-medium">
              {{ todayLogData.mood_category === 1 ? "When your heart is full, share your light with the world."
                : todayLogData.mood_category === 2 ? "Happiness grows when it's shared with others."
                  : todayLogData.mood_category === 3 ? "A calm mind can find opportunity in every moment."
                    : todayLogData.mood_category === 4 ? "One small positive thought can change your entire day."
                      : "You are stronger than you think; the storm will pass." }}

            </div>
          </div>
        </div>
        <!-- 右邊區域 -->
        <div class="xl:h-340px w-95% xl:w-auto flex flex-col mx-auto xl:mx-0">
          <!-- 睡眠資訊 -->
          <div
            class="xl:w-468px box-border p-20px rounded-16px bg-white border-1px border-solid border-[#E0E6FA] mb-20px">
            <div class="flex items-center text-Reddit text-18px font-medium text-[#57577B] mb-16px"><img
                src="/images/sleep_icon.svg" class="inline-block w-22px mr-13px" alt="">Sleep</div>
            <div class="text-Reddit text-32px font-bold tracking-[-0.3px] text-[#21214D]">{{ todayLogData.sleep_category
              ===
              0 || todayLogData.sleep_category === 1 ? "9+ hours" :
              todayLogData.sleep_category === 2 ? "7-8 hours" :
                todayLogData.sleep_category === 3 ? "5-6 hours" :
                  todayLogData.sleep_category === 4 ? "3-4 hours" : "0-2 hours" }}</div>
          </div>
          <!-- 感覺資訊 -->
          <div
            class="xl:flex-1 flex-none h-197px xl:h-auto xl:w-468px box-border p-20px rounded-16px bg-white border-1px border-solid border-[#E0E6FA] text-Reddit flex flex-col">
            <div class="flex items-center text-18px font-medium text-[#57577B] mb-16px"><img
                src="/images/start_icon.svg" class="inline-block w-22px mr-13px" alt="">Reflection of the day</div>
            <div class="text-18px text-[#21214D] flex-grow">{{ todayLogData.about }}</div>
            <div>
              <span v-if="TurnFeelCategories(todayLogData.feel_category).length > 0"
                v-for="item in TurnFeelCategories(todayLogData.feel_category)"
                class="text-Reddit text-18px font-italic text-[#57577B] mf-12px">
                #{{ item.text }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex xl:flex-row flex-col xl:justify-center justify-normal xl:items-start items-center">
        <!-- 左邊區域 -->
        <div v-if="GetLast5AverageData === null"
          class="xl:w-370px w-95% bg-[#FFFFFF] box-border p-24px rounded-16px border-1px border-solid border-[#E0E6FA] xl:mr-32px xl:mr-0 xl:mb-0 mb-32px mx-auto xl:mx-0">
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
        <div v-else
          class="xl:w-370px w-95% bg-[#FFFFFF] box-border p-24px rounded-16px border-1px border-solid border-[#E0E6FA] xl:mr-32px xl:mr-0 xl:mb-0 mb-32px mx-auto xl:mx-0">
          <!-- title1 -->
          <div class="mb-12px">
            <span class="text-Reddit text-20px font-semibold text-[#21214D]">Average Mood</span>
            <span class="text-Reddit text-15px tracking-[-0.3px] text-[#57577B]"> (Last 5 Check-ins)</span>
          </div>
          <!-- 資訊卡1 -->
          <div class="w-100% box-border px-20px py-41.75px rounded-16px relative overflow-hidden mb-24px"
            :class="[GetEachDataProps(GetLast5AverageData.moodCategory, GetLast5AverageData.sleepCategory).bg]">
            <div class="text-24px text-Reddit font-semibold text-[#21214D] mb-12px flex items-center">
              <img :src="GetEachDataProps(GetLast5AverageData.moodCategory, GetLast5AverageData.sleepCategory).src"
                class="inline-block w-24px mr-16px" alt="">{{ GetLast5AverageData.moodCategory === 1 ? "Very Happy" :
                  GetLast5AverageData.moodCategory === 2 ? "Happy" :
                    GetLast5AverageData.moodCategory === 3 ? "Neutral" :
                      GetLast5AverageData.moodCategory === 4 ? "Sad" : "Very Sad" }}
            </div>
            <div class="text-Reddit text-15px tracking-[-0.3px] text-[#21214D] flex items-center">
              <img src="/images/arrow_right.svg" class="inline-block w-10px mr-9px" alt="">Same as the previous 5
              check-ins
            </div>
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
          <div class="w-100% box-border px-20px py-41.75px rounded-16px bg-[#4865DB] relative overflow-hidden">
            <div class="text-24px text-Reddit font-semibold text-white mb-12px flex items-center">
              <img src="/images/sleep_icon_white.svg" class="inline-block h-24px mr-16px" alt="">{{
                GetLast5AverageData.sleepCategory === 1 ? "9+ hours" :
                  GetLast5AverageData.sleepCategory === 2 ? "7-8 hours" :
                    GetLast5AverageData.sleepCategory === 3 ? "5-6 hours" :
                      GetLast5AverageData.sleepCategory === 4 ? "3-4 hours" : "0-2 hours" }}
            </div>
            <div class="w-200px text-Reddit text-15px tracking-[-0.3px] text-white">
              <img src="/images/arrow_right_bottom.svg" class="inline-block w-10px mr-10px" alt="">Decrease from the previous 5 check-ins
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
        <div class="w-100% xl:w-auto">
          <div
            class="bg-[#FFFFFF] xl:w-768px w-95% rounded-16px box-border md:px-24px md:py-24px px-16px py-20px  border-1px border-solid border-[#E0E6FA] mx-auto xl:mx-0">
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
                  <div v-if="GetEachBarData(allLogData).length > 0" v-for="item in GetEachBarData(allLogData)"
                    class="!w-42px shrink-0 mr-16px box-border p-5px rounded-999px" :class="[item.bg, item.h]">
                    <div class="w-full aspect-[1/1] rounded-999px"><img :src="item.src" alt="" class="block w-100%">
                    </div>
                  </div>
                </div>
                <div class="absolute w-95% h-15% bottom-0 left-50% transform-translate-x-[-50%] flex">
                  <div v-if="GetMonthStr(allLogData).length > 0" v-for="item in GetMonthStr(allLogData)"
                    class="!w-42px shrink-0 mr-16px h-100% text-center content-center">
                    <div class="text-Reddit text-12px text-[rgba(33,33,77,0.7)]">{{ item.month }}</div>
                    <div class="text-Reddit text-13px font-semibold text-[#21214D]">{{ item.day }}</div>
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
