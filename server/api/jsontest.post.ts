import logger from '../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    // 讀取 POST 的 JSON 資料
    const body = await readBody(event)
    
    // 記錄收到的請求
    logger.info('收到 POST 請求：/api/jsontest', {
      method: 'POST',
      body: body,
      timestamp: new Date().toISOString()
    })
    
    // 驗證資料（可選）
    if (!body || Object.keys(body).length === 0) {
      logger.warn('收到空的 JSON 資料')
      return {
        success: false,
        message: '請提供有效的 JSON 資料'
      }
    }
    
    // 處理你的業務邏輯
    // ...
    
    // 記錄成功回應
    logger.info('成功處理請求', {
      receivedData: body
    })
    
    // 回傳結果
    return {
      success: true,
      message: '資料接收成功',
      receivedData: body,
      timestamp: new Date().toISOString()
    }
    
  } catch (error: any) {
    // 記錄錯誤
    logger.error('處理請求時發生錯誤', {
      error: error.message,
      stack: error.stack
    })
    
    // 回傳錯誤訊息
    return {
      success: false,
      message: '處理請求時發生錯誤',
      error: error.message
    }
  }
})