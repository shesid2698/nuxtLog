<script setup lang="ts">
const supabase = useSupabaseClient();
const url = useRequestURL();
const email = ref<string>("");
const password = ref<string>("");
const Login = () => {

}
/**
 * google 登入
 */
const SignInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // 登入成功後，設定跳回 '/confirm'
      redirectTo: `${url.origin}/confirm`,
    },
  })

  if (error) console.error(error)
}
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
        <div class="text-Reddit text-32px font-bold text-[#21214D] mb-8px tracking-[-0.3px]">Welcome back!
        </div>
        <div class="text-[#57577B] text-18px text-Reddit mb-32px tracking-[-0.3px]"> Log in to continue tracking your
          mood and sleep.</div>
        <!-- email -->
        <div class="text-[#21214D] text-18px text-Reddit mb-8px tracking-[-0.3px]">Email address</div>
        <div class="md:w-466px w-311px px-16px py-12px box-border input-container rounded-10px mb-20px">
          <input required type="email" class="w-100% text-Reddit text-18px border-none outline-none text-[#57577B]"
            placeholder="name@mail.com" autocomplete="username" v-model="email">
        </div>
        <!-- password -->
        <div class="text-[#21214D] text-18px text-Reddit mb-8px tracking-[-0.3px]">Password</div>
        <div class="md:w-466px w-311px px-16px py-12px box-border input-container rounded-10px mb-32px">
          <input required type="password" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            class="w-100% text-Reddit text-18px border-none outline-none text-[#57577B]"
            oninvalid="this.setCustomValidity('密碼請至少 8 碼，且包含大小寫英文字母與數字')" oninput="this.setCustomValidity('')"
            autocomplete="current-password" v-model="password">
        </div>
        <!-- sign up -->
        <div>
          <button
            class="box-border md:w-466px w-311px px-32px py-12px bg-[#4865DB] rounded-10px border-none outline-none cursor-pointer text-white text-Reddit text-20px font-medium mb-20px">Log
            in</button>
        </div>
        <div class="text-center text-Reddit text-18px text-[#57577B] mb-20px">Haven't got an account?
          <NuxtLink to="/sign-up" class="decoration-none"><span class="text-[#4865DB]">Sign up.</span></NuxtLink>
        </div>
        <div class="text-center text-Reddit text-18px text-[#57577B] mb-20px">Or Log in with</div>
        <div class="w-8% mx-auto cursor-pointer" @click="SignInWithGoogle"><img src="/images/logo_G.svg.webp"
            class="block" width="100%" alt=""></div>
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
