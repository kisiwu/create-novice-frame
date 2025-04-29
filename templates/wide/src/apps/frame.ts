import { Frame } from '@novice1/frame'
import { httpError, httpNotFound, validatorOnError } from '../middlewares/http'
import homepage from '../routers/homepage'
import tests from '../routers/tests'
import { docs } from '../utils/shapes/docs'

// init
export const frame = new Frame({
    docs,
    framework: {
        cors: false,
        validatorOnError
    },
    routers: [
        homepage,
        tests
    ]
})

// 404 - 500
frame
    .use(httpNotFound)
    .useError(httpError)
