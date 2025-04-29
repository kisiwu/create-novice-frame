import pckg from '../../package.json'

export const APP_NAME: string = pckg.name
export const APP_VERSION: string = pckg.version
export const APP_DESCRIPTION: string = pckg.description
export const APP_LICENSE: string = pckg.license
export const PORT: number = process.env.PORT && !isNaN(parseInt(process.env.PORT)) ? parseInt(process.env.PORT) : 8000
