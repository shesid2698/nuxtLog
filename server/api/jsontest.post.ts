export default defineEventHandler(async(event) => {
  // 1. 記錄帶有資料的物件 (Pino 的最佳實踐是將物件放在第一個參數)
  const data = await readBody(event)
    logger.info({path:'/api/jsontest.ts',data},'收到 /api/test 的請求')

  try {
    // 模擬商業邏輯
    if (!data.id) {
      throw new Error('缺少 ID')
    }
    return { success: true, id: data.id }
  } catch (error: any) {
    // 2. 錯誤記錄
    logger.error({ err: error }, '處理請求時發生錯誤')
    
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})