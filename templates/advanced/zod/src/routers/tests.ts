import routing from '@novice1/routing'
import { z } from 'zod/v4'
import { ContextResponseShape, controller, GroupResponseShape, MediaTypeUtil, ResponseUtil } from '@novice1/frame'
import { badRequestResponse } from '../utils/shapes/responses/errorResponses'

const router = routing()

export default routing().use('/tests', router)

//#region /greet

const querySchema = z.object({
    greeting: z.enum(['Hello', 'Hi'])
        .optional()
        .default('Hello'),

    name: z.string()
        .trim()
        .min(2)
        .max(18)
        .refine(v => v != 'Frank')
        .optional()
        .default('world')
        .meta({
            description: 'Your name (_"Frank"_ is not allowed)'
        }),
})

type QueryType = z.infer<typeof querySchema>

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
    controller(
        async ({ validated }) =>
            `${validated<QueryType>?.().query?.greeting} ${validated<QueryType>?.().query?.name}!`
    )
)

//#endregion /greet


//#region /combination

const combinationSchema = z.object({
    n: z.int()
        .positive()
        .min(1)
        .max(50)
        .meta({
            description: 'Number of total objects',
            examples: [5]
        }),
    r: z.preprocess((x) => Number(x), z.enum({
        one: 1,
        two: 2,
        three: 3
    }).meta({
        description: 'Number of objects chosen at once'
    })).optional().default(3)
})
.refine( schema => {
    return schema.n >= schema.r
}, {
    error: 'make sure that n ≥ r'
} )
.meta({
    description: 'combination nCr inputs',
    ref: '#/components/schemas/CombinationInputs' // this will create the schema in OpenAPI
})

type CombinationInputs = z.infer<typeof combinationSchema>

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
                            $ref: `${combinationSchema.meta()?.ref}` // this will use the schema created above
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
            return { inputs: { n, r }, result }
        }
    )
)

//#endregion /combination
