import routing from '@novice1/routing'
import { Static, Type } from '@sinclair/typebox'
import { ContextResponseShape, controller, GroupResponseShape, MediaTypeUtil, ResponseUtil } from '@novice1/frame'
import { badRequestResponse } from '../utils/shapes/responses/errorResponses'
import { validatorOnError } from '../middlewares/http'

const router = routing()

export default routing().use('/tests', router)

//#region /greet

const querySchema = Type.Object({
    greeting: Type.Optional(Type.Enum({
        hello: 'Hello',
        hi: 'Hi'
    }, {
        default: 'Hello',
        type: 'string'
    })),

    name: Type.Optional(Type.String({
        default: 'world',
        description: 'Your name (_"Frank"_ is not allowed)',
        minLength: 2,
        maxLength: 18,
        pattern: '^(?! *Frank *$).*'
    }))
})

type QueryType = Static<typeof querySchema>

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

const combinationSchema = Type.Object({
    n: Type.Integer({
        description: 'Number of total objects',
        examples: [5],
        minimum: 1,
        maximum: 50
    }),

    r: Type.Optional(
        Type.Enum({
            one: 1,
            two: 2,
            three: 3
        }, {
            description: 'Number of objects chosen at once',
            default: 3,
            type: 'integer'
        })
    )
}, {
    $id: '#/components/schemas/CombinationInputs', // this will create the schema in OpenAPI
    description: 'combination nCr inputs'
})

type CombinationInputs = Static<typeof combinationSchema>

type CombinationSuccess = { inputs: CombinationInputs, result: number }

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
        schema: Type.Object({
            body: combinationSchema
        })
    },
    responses: new GroupResponseShape([
        // 200
        new ResponseUtil()
            .setDescription('Success')
            .addMediaType('application/json', new MediaTypeUtil({
                schema: {
                    type: 'object',
                    properties: {
                        inputs: Type.Ref(combinationSchema.$id!), // this will use the schema created above
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
