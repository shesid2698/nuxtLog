export const logger = {
  info: (msg: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message: msg,
      data,
      timestamp: new Date().toISOString()
    }))
  },
  error: (msg: string, data?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message: msg,
      data,
      timestamp: new Date().toISOString()
    }))
  },
  warn: (msg: string, data?: any) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message: msg,
      data,
      timestamp: new Date().toISOString()
    }))
  }
}

export default logger