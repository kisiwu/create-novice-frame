import Logger from '@novice1/logger'
import { AddressInfo } from 'net'
import './config/log'
import { frame } from './apps/frame'
import { PORT } from './config/app'

// listen
const server = frame.listen(PORT, () => {
    const addressInfo = server.address() as AddressInfo
    Logger.info('Application listening on port', addressInfo.port);
})
