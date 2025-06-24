import { Frame } from '@novice1/frame'
import validatorJoi from '@novice1/validator-joi'
import { SCHEMA_PROPERTY } from '../config/app'
import { httpError, httpNotFound, validatorOnError } from '../middlewares/http'
import homepage from '../routers/homepage'
import tests from '../routers/tests'
import { docs } from '../utils/shapes/docs'

// init
export const frame = new Frame({
    docs,
    framework: {
        cors: false,
        validators: [
            validatorJoi(
                { stripUnknown: true },
                validatorOnError,
                SCHEMA_PROPERTY
            )
        ]
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
