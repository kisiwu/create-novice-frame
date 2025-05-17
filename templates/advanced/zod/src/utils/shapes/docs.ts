import { DocsShape, GroupResponseShape } from '@novice1/frame'
import { APP_DESCRIPTION, APP_NAME, APP_VERSION, DOC_PATH, HOST, SCHEMA_PROPERTY } from '../../config/app'
import { OpenAPIZodHelper, PostmanZodHelper } from '@novice1/api-doc-zod-helper'
import { badRequestResponse, badRequestSchema } from './responses/errorResponses'

export const docs = new DocsShape()
    .setOpenAPIOptions({ helperSchemaProperty: SCHEMA_PROPERTY, helperClass: OpenAPIZodHelper })
    .setPostmanOptions({ helperSchemaProperty: SCHEMA_PROPERTY, helperClass: PostmanZodHelper })
    .setPath(DOC_PATH)
    .setHost({
        url: HOST,
        description: APP_DESCRIPTION
    })
    .setTitle(APP_NAME)
    .setVersion(APP_VERSION)
    .setLicense('')
    .setTags([
        {
            name: 'Tests',
            description: 'Only built for API testing.',
            externalDocs: {
                url: 'https://www.postman.com/api-platform/api-testing/',
                description: `Learn how API testing can help teams confirm
                    that their API's endpoints, methods, and
                    integrations are functioning as expected.`
            }
        }
    ])
    .setSchemas([
        badRequestSchema
    ])
    .setResponses(
        new GroupResponseShape([
            badRequestResponse
        ])
    )
    .setSwaggerUIOptions({
        customCssUrl: '/swagger-ui.css'
    })