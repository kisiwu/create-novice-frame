import Logger from '@novice1/logger'

/**
 * error = 0, warn = 1, info = 2, verbose = 4, debug = 5, silly = 7
 */
export const LOG_LEVEL: number = process.env.LOG_LEVEL && !isNaN(parseInt(process.env.LOG_LEVEL)) ? parseInt(process.env.LOG_LEVEL) : 2
export const LOG_DEBUG: string = process.env.LOG_DEBUG || ''

Logger.setLevel(LOG_LEVEL)
Logger.Debug.enable(LOG_DEBUG)
