import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建日志目录
const logDir = path.join(__dirname, '../logs')

// 设置日志级别，根据环境变量决定
const logLevel = process.env.LOG_LEVEL || 'info'

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({
    stack: true
  }),
  winston.format.splat(),
  winston.format.json()
)

// 创建控制台日志传输
const consoleTransport = new winston.transports.Console({
  level: logLevel,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
})

// 创建文件日志传输 - 错误日志
const errorFileTransport = new DailyRotateFile({
  level: 'error',
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
})

// 创建文件日志传输 - 所有日志
const combinedFileTransport = new DailyRotateFile({
  level: logLevel,
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
})

// 创建日志记录器
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'infodata-app' },
  transports: [
    consoleTransport,
    errorFileTransport,
    combinedFileTransport
  ]
})

// 添加开发环境特定配置
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
