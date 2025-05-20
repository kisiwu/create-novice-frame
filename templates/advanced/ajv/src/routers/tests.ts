import routing from '@novice1/routing'
import { JSONSchemaType }  from 'ajv'
import { ContextResponseShape, controller, GroupResponseShape, MediaTypeUtil, ResponseUtil } from '@novice1/frame'
import { badRequestResponse } from '../utils/shapes/responses/errorResponses'
import { validatorOnError } from '../middlewares/http'

const router = routing()

export default routing().use('/tests', router)

//#region /greet

type QueryType = {
    greeting?: 'Hello' | 'Hi';
    name?: string;
}

const querySchema: JSONSchemaType<QueryType> = {
    type: 'object',
    properties: {
        greeting: {
            type: 'string',
            nullable: true,
            default: 'Hello',
            enum: ['Hello', 'Hi']
        },
        name: {
            type: 'string',
            nullable: true,
            default: 'world',
            pattern: '^(?! *Frank *$).*',
            description: 'Your name (_"Frank"_ is not allowed)',
            minLength: 3,
            maxLength: 18
        }
    }
}


router.get({
    path: '/greet',
    name: 'Greet',
    description: 'Give a sign of welcome.',
    tags: ['Tests'],
    parameters: {
        schema: {
            query: querySchema
        }
    },
    responses: new GroupResponseShape([
        // 200
        new ResponseUtil()
            .setDescription('Success')
            .addMediaType('text/plain', new MediaTypeUtil({
                examples: {
                    default: {
                        value: 'Hello world!'
                    },
                    '?name=Patrice': {
                        value: 'Hello Patrice!'
                    },
                    '?greeting=Hi&name=everyone': {
                        value: 'Hi everyone!'
                    }
                },
                schema: {
                    type: 'string'
                }
            }))
            .setCode(200),
        // 400
        new ContextResponseShape(badRequestResponse)
            .setCode(400)
    ])

},
    controller<never, string, never, QueryType>(
        async ({ query: { greeting, name } }) =>
            `${greeting || 'Hello'} ${name || 'world'}!`
    )
)

//#endregion /greet


//#region /combination

type CombinationInputs = {
    n: number;
    r?: 1 | 2 | 3;
}

type CombinationSuccess = { inputs: CombinationInputs, result: number }

const combinationSchema: JSONSchemaType<CombinationInputs> = {
    $id: '#/components/schemas/CombinationInputs', // this will create the schema in OpenAPI
    type: 'object',
    description: 'combination nCr inputs',
    properties: {
        n: {
            type: 'integer',
            description: 'Number of total objects',
            minimum: 1,
            maximum: 50,
            examples: [5]
        },
        r: {
            type: 'integer',
            description: 'Number of objects chosen at once',
            nullable: true,
            default: 3,
            enum: [1, 2, 3],
        }
    },
    required: ['n'],
    additionalProperties: false
}

function productRange(a: number, b: number) {
    let result = a,
        i = a;
    while (i++ < b) {
        result *= i;
    }
    return result;
}

router.post({
    path: '/combination',
    name: 'Calculate Combination (nCr)',
    description: 'Calculate the combination of n and r.',
    tags: ['Tests'],
    parameters: {
        schema: {
            type: 'object',
            properties: {
                body: combinationSchema
            },
            required: ['body']
        } as JSONSchemaType<{ body: CombinationInputs }>
    },
    responses: new GroupResponseShape([
        // 200
        new ResponseUtil()
            .setDescription('Success')
            .addMediaType('application/json', new MediaTypeUtil({
                schema: {
                    type: 'object',
                    properties: {
                        inputs: {
                            $ref: '#/components/schemas/CombinationInputs' // this will use the schema created above
                        },
                        result: {
                            type: 'number',
                            example: 10
                        }
                    }
                }
            }))
            .setCode(200),
        // 400
        new ContextResponseShape(badRequestResponse)
            .setCode(400)
    ])
},
    controller<never, CombinationSuccess | void, CombinationInputs>(
        async (req, res, next) => {
            const { body: { n, r } } = req
            const evaluatedR = r || 3

            // validate that n >= r
            if (n < evaluatedR) {
                return validatorOnError({ errors: [{ message: 'make sure that n ≥ r' }] }, req, res, next)
            }

            // set "r" in case it was undefined
            req.body.r = evaluatedR
            return next()
        }
    ),

    controller<never, CombinationSuccess, Required<CombinationInputs>>(
        async ({ body: { n, r } }) => {
            let result = 1
            if (n != r) {
                const sample = (r < n - r) ? n - r : r;
                result = productRange(sample + 1, n) / productRange(1, n - sample)
            }
            return { inputs: { n, r: r }, result }
        }
    )
)

//#endregion /combination
