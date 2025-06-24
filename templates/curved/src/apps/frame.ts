import { Frame } from '@novice1/frame'
import { httpError, httpNotFound, validatorOnError } from '../middlewares/http'
import homepage from '../routers/homepage'
import tests from '../routers/tests'

// init
export const frame = new Frame({
    framework: {
        cors: false,
        validatorOnError
    },
    routers: [
        homepage,
        tests
    ]
})

frame
    .set('query parser', 'extended') // extended query parser based on qs 
    .use(httpNotFound) // 404
    .useError(httpError) // 500
    .disable('x-powered-by')
