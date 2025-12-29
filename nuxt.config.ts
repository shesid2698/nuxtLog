// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint','@nuxtjs/supabase','@unocss/nuxt'],
  supabase:{
    redirect:false
  },
  runtimeConfig: {
    // 這裡的變數只能在 Server 端 (API) 讀取，非常安全
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    rsaPrivateKey: process.env.RSA_PRIVATE_KEY,
    public: {
      rsaPublicKey: process.env.NUXT_PUBLIC_RSA_PUBLIC_KEY
    }
  }
})