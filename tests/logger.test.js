import logger from '../config/logger.js'

console.log('Testing logger configuration...')

// 测试不同级别的日志
logger.debug('This is a debug message')
logger.info('This is an info message')
logger.warn('This is a warning message')
logger.error('This is an error message', { error: new Error('Test error') })

console.log('Logger test completed. Check logs directory for log files.')
