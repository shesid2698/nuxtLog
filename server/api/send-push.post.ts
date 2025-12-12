import { google } from 'googleapis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  body.data.timestamp = new Date().toISOString()
  const { token, title, body: messageBody, data } = body

  // 驗證必填欄位
  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Device token is required'
    })
  }

  // if (!title || !messageBody) {
  //   throw createError({
  //     statusCode: 400,
  //     message: 'Title and body are required'
  //   })                               
  // }

  try {
    // 1. 設定 Service Account 憑證
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

    if (!privateKey || !clientEmail) {
      throw new Error('Firebase credentials not configured')
    }
    // 2. 建立 JWT Client
    const jwtClient = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging']
    })

    // 3. 獲取 OAuth 2.0 Access Token
    const tokens = await jwtClient.authorize()
    const accessToken = tokens.access_token

    if (!accessToken) {
      throw new Error('Failed to obtain access token')
    }

    console.log('✅ Access Token obtained')

    // 4. 發送 FCM 推播
    const projectId = process.env.FIREBASE_PROJECT_ID
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

    const response = await $fetch(fcmUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        message: {
          token,
          notification: {
            title,
            body: messageBody
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              click_action: 'FLUTTER_NOTIFICATION_CLICK'
            }
          },
          data: data || {}
        }
      }
    })

    console.log('✅ Push notification sent:', response)

    return {
      success: true,
      messageId: response,
      message: 'Push notification sent successfully'
    }

  } catch (error: any) {
    console.error('❌ FCM Error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to send push notification',
      data: error.data
    })
  }
})