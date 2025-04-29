import { Frame } from '@novice1/frame'
import Logger from '@novice1/logger'
import { PORT } from './config/app'

// init
const frame = new Frame()

// home page (/)
frame.get('/', (_, res) => {
    return res.send('Hello world!')
})

// listen
frame.listen(PORT, () => {
    Logger.info(`Application listening on port ${PORT}!`)
})
