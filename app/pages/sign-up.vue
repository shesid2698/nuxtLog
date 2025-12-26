<script setup lang="ts">
const supabase = useSupabaseClient();

const signInWithGoogle = async () => {
  // 1. 呼叫 Supabase SDK 觸發 OAuth
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // 2. 設定登入成功後，要跳回 Nuxt 的哪個頁面？
      // 這裡我們設定跳回 '/confirm' 頁面來處理轉址
      redirectTo: `/confirm`, 
    },
  })

  if (error) console.error(error)
}
</script>
<template>
    <div id="main">
        <!-- title -->
        <div class="flex w-fit h-fit mt-80px items-center justify-between mx-auto">
            <div class="mr-16px"><img src="/images/Logo_icon.svg" class="block" height="100%" alt=""></div>
            <div class="text-Reddit font-bold text-21px text-[#21214D] tracking-[-0.8px]">Mood tracker</div>
        </div>
        <!-- login-card -->
        <div class="md:mt-48px mt-32px md:w-530px w-343px box-border login-container md:px-32px px-16px py-40px mx-auto rounded-16px">
            <div class="text-Reddit text-32px font-bold text-[#21214D] mb-8px tracking-[-0.3px]">Create an account</div>
            <div class="text-[#57577B] text-18px text-Reddit mb-32px tracking-[-0.3px]">Join to track your daily mood and sleep with ease.</div>
            <!-- email -->
            <div class="text-[#21214D] text-18px text-Reddit mb-8px tracking-[-0.3px]">Email address</div>
            <div class="md:w-466px w-311px px-16px py-12px box-border input-container rounded-10px mb-20px">
                <input type="email" class="w-100% text-Reddit text-18px border-none outline-none text-[#57577B]" placeholder="name@mail.com">
            </div>
            <!-- password -->
            <div class="text-[#21214D] text-18px text-Reddit mb-8px tracking-[-0.3px]">Password</div>
            <div class="md:w-466px w-311px px-16px py-12px box-border input-container rounded-10px mb-32px">
                <input type="password" class="w-100% text-Reddit text-18px border-none outline-none text-[#57577B]">
            </div>
            <!-- sign up -->
            <div>
                <button class="box-border md:w-466px w-311px px-32px py-12px bg-[#4865DB] rounded-10px border-none outline-none cursor-pointer text-white text-Reddit text-20px font-medium mb-20px">Sign Up</button>
            </div>
            <div class="text-center text-Reddit text-18px text-[#57577B] mb-20px">Already got an account? <NuxtLink to="#" class="decoration-none"><span class="text-[#4865DB]">Log in.</span></NuxtLink></div>
            <div class="text-center text-Reddit text-18px text-[#57577B] mb-20px">Or Sign in with</div>
            <div class="w-8% mx-auto cursor-pointer" @click="signInWithGoogle"><img src="/images/logo_G.svg.webp" class="block" width="100%" alt=""></div>
        </div>
    </div>
</template>
<style scoped>
#main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: linear-gradient(180deg, #FAFAFF 73%, #E0E0FF 100%);
}

.text-Reddit {
    font-family: 'Reddit Sans', sans-serif;
}

.login-container{
    background-color: white;
    box-shadow: 0px 8px 16px 0px rgba(32, 37, 41, 0.08);
}
.input-container{
    border:1px solid #9393B7;
}
</style>