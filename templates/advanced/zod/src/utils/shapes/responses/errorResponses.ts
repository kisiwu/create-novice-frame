import {
    MediaTypeShape,
    ResponseShape,
    SchemaShape
} from '@novice1/frame'

export const badRequestSchema = new SchemaShape('BadRequestSchema', {
    type: 'object',
    properties: {
        issues: {
            description: 'The details about the issues.',
            type: 'array',
            items: {
                type: 'object'
            }
        },
        message:{
            type: 'string'
        },
        label: {
            type: 'string'
        }
    },
    additionalProperties: true,
    required: [
        'message',
        'label'
    ]
})

export const badRequestResponse = new ResponseShape('BadRequestResponse')
    .setDescription('Error: Bad Request')
    .addMediaType('application/json', new MediaTypeShape({
        schema: badRequestSchema
    }))