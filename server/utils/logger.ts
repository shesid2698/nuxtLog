import pino from 'pino'
import fs from 'fs'
import path from 'path'

// 確保 logs 目錄存在
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// 取得當天日期的 log 檔案
function getLogFile() {
  const date = new Date().toISOString().split('T')[0]
  return path.join(logsDir, `app-${date}.log`)
}

// Console 顯示用（開發環境）
export const consoleLogger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
})

// 檔案記錄用（生產環境）
export const fileLogger = pino(
  {
    level: 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination({
    dest: getLogFile(),
    sync: false
  })
)

// 整合兩者
export const logger = {
  info: (msg: string, data?: any) => {
    consoleLogger.info(data || {}, msg)
    fileLogger.info(data || {}, msg)
  },
  error: (msg: string, data?: any) => {
    consoleLogger.error(data || {}, msg)
    fileLogger.error(data || {}, msg)
  },
  warn: (msg: string, data?: any) => {
    consoleLogger.warn(data || {}, msg)
    fileLogger.warn(data || {}, msg)
  },
  debug: (msg: string, data?: any) => {
    consoleLogger.debug(data || {}, msg)
    fileLogger.debug(data || {}, msg)
  }
}

export default logger