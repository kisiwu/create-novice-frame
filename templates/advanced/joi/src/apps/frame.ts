import { Frame, GenerateComponentsRule } from '@novice1/frame'
import express from 'express'
import { validatorJoi } from '@novice1/validator-joi'
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
            validatorJoi(
                { stripUnknown: true },
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
    .use(express.static('public')) // static files
    .use(httpNotFound) // 404
    .useError(httpError) // 500
    .disable('x-powered-by')

// additional docs configuration
frame
    .openapi
    .setGenerateComponentsRule(GenerateComponentsRule.ifUndefined)
