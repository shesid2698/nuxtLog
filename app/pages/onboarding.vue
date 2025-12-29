<script setup>

</script>
<template>
  <div id="main">
    <form action="" @submit.prevent="Login">
      <!-- title -->
      <div class="flex w-fit h-fit mt-80px items-center justify-between mx-auto">
        <div class="mr-16px"><img src="/images/Logo_icon.svg" class="block" height="100%" alt=""></div>
        <div class="text-Reddit font-bold text-21px text-[#21214D] tracking-[-0.8px]">Mood tracker</div>
      </div>

      <!-- login-card -->
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
            placeholder="Jane Appleseed" autocomplete="username" v-model="email">
        </div>

        <div class="md:w-466px w-311px flex mb-32px">
          <div class="mr-20px"><img src="/images/Avatar.svg" width="64" height="64" alt=""></img></div>

          <div class="tracking-[-0.3px] text-Reddit">
            <div class="text-[18px] text-[#21214D] mb-6px">Upload Image</div>
            <div class="text-15px text-[#57577B] mb-16px">Max 250KB, PNG or JPEG</div>
            <label
                class="text-Reddit text-18px font-medium text-[#21214D] box-border px-16px py-8px bg-[#ffffff] border-1px border-solid border-[#9393B7] rounded-8px w-fit block"><input
                  type="file" class="hidden">
                Upload</label>
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
