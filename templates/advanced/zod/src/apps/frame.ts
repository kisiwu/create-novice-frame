import { Frame, GenerateComponentsRule } from '@novice1/frame'
import express from 'express'
import { validatorZod } from '@novice1/validator-zod'
import { SCHEMA_PROPERTY } from '../config/app'
import { httpError, httpNotFound, validatorOnError } from '../middlewares/http'
import tests from '../routers/tests'
import { docs } from '../utils/shapes/docs'

// init
export const frame = new Frame({
    docs,
    framework: {
        cors: false,
        validators: [
            validatorZod(
                {},
                validatorOnError,
                SCHEMA_PROPERTY
            )
        ]
    },
    routers: [
        tests
    ]
})

frame
    .set('query parser', 'extended') // extended query parser based on qs 
    .use(express.static('public')) // static files
    .use(httpNotFound) // 404
    .useError(httpError) // 500
    .disable('x-powered-by')

// additional docs configuration
frame
    .openapi
    .setGenerateComponentsRule(GenerateComponentsRule.ifUndefined)
