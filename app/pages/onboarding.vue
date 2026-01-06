<script setup lang="ts">
const user = useSupabaseUser();
const session = useSupabaseSession();
const name = ref<string>("");
  /**用來儲存檔案物件 */
const selectedFile = ref<File | null>(null);
  /**用來預覽上船的圖片 */
const previewUrl = ref('');
onMounted(async () => {
  if (!user.value) {
    await navigateTo('sign-up', {
      external: true
    })
  }
})
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
/**取得使用者頭像 */
const GetProfilePic = computed(() => {
  return previewUrl.value || '/images/Avatar.svg';
});
</script>
<template>
  <div id="main">
    <form action="" @submit.prevent="UpdateUser">
      <!-- title -->
      <div class="flex w-fit h-fit mt-80px items-center justify-between mx-auto">
        <div class="mr-16px"><img src="/images/Logo_icon.svg" class="block" height="100%" alt=""></div>
        <div class="text-Reddit font-bold text-21px text-[#21214D] tracking-[-0.8px]">Mood tracker</div>
      </div>

      <!-- card -->
      <div
        class="md:mt-48px mt-32px md:w-530px w-343px box-border login-container md:px-32px px-16px py-40px mx-auto rounded-16px">
        <div class="text-Reddit text-32px font-bold text-[#21214D] mb-8px tracking-[-0.3px]">Personalize your experience
        </div>
        <div class="text-[#57577B] text-18px text-Reddit mb-32px tracking-[-0.3px]">Add your name and a profile picture
          to make Mood yours.</div>

        <div class="text-Reddit text-18px tracking-[-0.3px] text-[#21214D] mb-8px">Name</div>
        <!-- 姓名input -->
        <div class="md:w-466px w-311px px-16px py-12px box-border input-container rounded-10px mb-24px">
          <input required type="text" class="w-100% text-Reddit text-18px border-none outline-none text-[#57577B]"
            placeholder="Jane Appleseed" autocomplete="username" v-model="name">
        </div>

        <div class="md:w-466px w-311px flex mb-32px">
          <div class="mr-20px"><img :src="GetProfilePic" width="64" height="64" alt="" class="rounded-999px"></img></div>

          <div class="tracking-[-0.3px] text-Reddit">
            <div class="text-[18px] text-[#21214D] mb-6px">Upload Image</div>
            <div class="text-15px text-[#57577B] mb-16px">Max 250KB, PNG or JPEG</div>
            <label
              class="box-border px-16px py-8px rounded-8px bg-white border-1px border-solid border-[#9393B7] w-fit text-Reddit text-18px text-[#21214D] cursor-[url(/images/pointer.svg),_pointer]">Upload<input
                type="file" class="hidden" accept="image/*" @change="HandleFileChange"></label>
          </div>
        </div>

        <div>
          <button
            class="box-border md:w-466px w-311px px-32px py-12px bg-[#4865DB] rounded-10px border-none outline-none cursor-pointer text-white text-Reddit text-20px font-medium mb-20px">Start
            Tracking</button>
        </div>
      </div>
    </form>
  </div>
</template>
<style scoped>
#main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F5FF 73%, #E0E0FF 100%);
}

.text-Reddit {
  font-family: 'Reddit Sans', sans-serif;
}

.login-container {
  background-color: white;
  box-shadow: 0px 8px 16px 0px rgba(32, 37, 41, 0.08);
}

.input-container {
  border: 1px solid #9393B7;
}
</style>
