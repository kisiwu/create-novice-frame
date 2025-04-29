import { DocsShape } from '@novice1/frame';
import { APP_DESCRIPTION, APP_NAME, APP_VERSION, SCHEMA_PROPERTY } from '../../config/app';

export const docs = new DocsShape()
    .setOpenAPIOptions({ helperSchemaProperty: SCHEMA_PROPERTY })
    .setPostmanOptions({ helperSchemaProperty: SCHEMA_PROPERTY })
    .setPath('/docs')
    .setTitle(APP_NAME)
    .setVersion(APP_VERSION)
    .setLicense('')
    .setHost({
        url: '{protocol}://{domain}{port}',
        description: APP_DESCRIPTION,
        variables: {
            protocol: {
                enum: [
                    'http',
                    'https'
                ],
                default: 'http'
            },
            domain: {
                default: 'localhost'
            },
            port: {
                enum: [
                    '',
                    ':8080',
                    ':8000'
                ],
                default: ':8080'
            }
        }
    })
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