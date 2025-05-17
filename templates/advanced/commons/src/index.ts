import Logger from '@novice1/logger'
import { AddressInfo } from 'net'
import './config/log'
import { frame } from './apps/frame'
import { DOC_PATH, HOST, PORT } from './config/app'

// listen
const server = frame.listen(PORT, () => {
    const addressInfo = server.address() as AddressInfo
    Logger.info(`Application listening on port ${addressInfo.port}`)
    Logger.log(`
        Documentation at 
        - ${HOST}${DOC_PATH}
        - ${HOST}${DOC_PATH}/redoc
        - ${HOST}${DOC_PATH}/schema
        - ${HOST}${DOC_PATH}/schema?format=postman
    `);
})
