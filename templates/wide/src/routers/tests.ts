import routing from '@novice1/routing'
import { controller } from '@novice1/frame'
import Joi from 'joi'

const router = routing()

router.get({
    path: '/greetings',
    name: 'Greetings',
    description: 'A short greeting.',
    tags: ['Tests'],
    parameters: {
        schema: {
            query: {
                name: Joi.string()
                    .min(2)
                    .max(18)
                    .invalid('Frank')
                    .description('Your name ("Frank" is not allowed)')
            }
        }
    }
},
    controller<never, string, never, { name?: string }>(
        async ({ query: { name } }) => `Hello ${name || 'world'}!`
    )
)

export default routing().use('/tests', router)
