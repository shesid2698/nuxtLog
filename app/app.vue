<template>
  <div>
    <NuxtPage />
  </div>
</template>
<style>
body {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

@font-face {
  font-family: 'Reddit Sans';
  src: url('/fonts/Reddit_Sans/RedditSans-VariableFont_wght.ttf') format('truetype');
  font-weight: 100 900;
  /* 設定支援的粗細範圍 */
  font-style: normal;
  font-display: swap;
  /* 建議加入，避免載入時文字隱形 */
}

@font-face {
  font-family: 'Reddit Sans';
  src: url('/fonts/Reddit_Sans/RedditSans-Italic-VariableFont_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-style: italic;
  font-display: swap;
}
</style>