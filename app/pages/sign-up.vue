<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const url = useRequestURL();
const email = ref<string>("");
const password = ref<string>("");
const Encryption = useEncryption();
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
/**
 * 註冊帳號
 */
const SignUp = async () => {
    console.log("註冊",`帳號:${email.value};密碼:${password.value}`);
    const runtimeConfig = useRuntimeConfig()
    console.log('密碼',await Encryption.encryptData(password.value,runtimeConfig.public.rsaPublicKey))
}
watchEffect(() => {
    if (user.value) {
        return navigateTo("/")
    }
})
</script>
<template>
    <div id="main">
        <form action="" @submit.prevent="SignUp">
            <!-- title -->
            <div class="flex w-fit h-fit mt-80px items-center justify-between mx-auto">
                <div class="mr-16px"><img src="/images/Logo_icon.svg" class="block" height="100%" alt=""></div>
                <div class="text-Reddit font-bold text-21px text-[#21214D] tracking-[-0.8px]">Mood tracker</div>
            </div>
            <!-- login-card -->
            <div
                class="md:mt-48px mt-32px md:w-530px w-343px box-border login-container md:px-32px px-16px py-40px mx-auto rounded-16px">
                <div class="text-Reddit text-32px font-bold text-[#21214D] mb-8px tracking-[-0.3px]">Create an
                    account
                </div>
                <div class="text-[#57577B] text-18px text-Reddit mb-32px tracking-[-0.3px]">Join to track your daily
                    mood and sleep with ease.</div>
                <!-- email -->
                <div class="text-[#21214D] text-18px text-Reddit mb-8px tracking-[-0.3px]">Email address</div>
                <div class="md:w-466px w-311px px-16px py-12px box-border input-container rounded-10px mb-20px">
                    <input required type="email"
                        class="w-100% text-Reddit text-18px border-none outline-none text-[#57577B]"
                        placeholder="name@mail.com" autocomplete="username"
                        v-model="email">
                </div>
                <!-- password -->
                <div class="text-[#21214D] text-18px text-Reddit mb-8px tracking-[-0.3px]">Password</div>
                <div class="md:w-466px w-311px px-16px py-12px box-border input-container rounded-10px mb-32px">
                    <input required type="password" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        class="w-100% text-Reddit text-18px border-none outline-none text-[#57577B]"
                        oninvalid="this.setCustomValidity('密碼請至少 8 碼，且包含大小寫英文字母與數字')"
                        oninput="this.setCustomValidity('')"
                        autocomplete="current-password"
                        v-model="password">
                </div>
                <!-- sign up -->
                <div>
                    <button
                        class="box-border md:w-466px w-311px px-32px py-12px bg-[#4865DB] rounded-10px border-none outline-none cursor-pointer text-white text-Reddit text-20px font-medium mb-20px">Sign
                        Up</button>
                </div>
                <div class="text-center text-Reddit text-18px text-[#57577B] mb-20px">Already got an account?
                    <NuxtLink to="/login" class="decoration-none"><span class="text-[#4865DB]">Log in.</span></NuxtLink>
                </div>
                <div class="text-center text-Reddit text-18px text-[#57577B] mb-20px">Or Sign in with</div>
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
    background: linear-gradient(180deg, #FAFAFF 73%, #E0E0FF 100%);
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
