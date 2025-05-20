import routing from '@novice1/routing'
import Joi from 'joi'
import { ContextResponseShape, controller, GroupResponseShape, MediaTypeUtil, ResponseUtil } from '@novice1/frame'
import { badRequestResponse } from '../utils/shapes/responses/errorResponses'

const router = routing()

export default routing().use('/tests', router)

//#region /greet

const querySchema = Joi.object().keys({
    greeting: Joi.string()
        .valid('Hello', 'Hi')
        .default('Hello')
        .optional(),

    name: Joi.string()
        .description('Your name (_"Frank"_ is not allowed)')
        .min(2)
        .max(18)
        .trim()
        .invalid('Frank')
        .default('world')
        .optional()
})

type QueryType = {
    greeting: 'Hello' | 'Hi';
    name: string;
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
        async ({ validated }) =>
            `${validated<QueryType>?.().query?.greeting} ${validated<QueryType>?.().query?.name}!`
    )
)

//#endregion /greet


//#region /combination

const combinationSchema = Joi.object().keys({
    n: Joi.number()
        .description('Number of total objects')
        .integer()
        .min(1)
        .max(50)
        .example(5)
        .when('r', {
            is: Joi.number(),
            then: Joi.number().min(Joi.ref('r'))
        })
        .required(),

    r: Joi.number()
        .description('Number of objects chosen at once')
        .integer()
        .valid(1, 2, 3)
        .default(3)
        .example(3)
        .optional()
}).meta({
    ref: '#/components/schemas/CombinationInputs' // this will create the schema in OpenAPI
})
    .description('combination nCr inputs')
    .required()

type CombinationInputs = {
    n: number;
    r: 1 | 2 | 3;
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
            body: combinationSchema
        }
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
    controller<never, { inputs: CombinationInputs, result: number }, CombinationInputs>(
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
