import pino from 'pino'

const config = {
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    // 使用 'targets' 陣列可以同時輸出到多個地方
    targets: [
      // 輸出目標 1: 控制台 (開發時用 pino-pretty，正式環境用標準輸出)
      process.env.NODE_ENV === 'development'
        ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' }
        }
        : {
          target: 'pino/file', // 標準輸出 (stdout)
          options: { destination: 1 } // 1 代表 stdout
        },
    ]
  }
}

export const logger = pino(config)