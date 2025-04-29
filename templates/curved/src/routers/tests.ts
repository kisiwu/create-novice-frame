import routing, { Request } from '@novice1/routing'
import Joi from 'joi'

const router = routing()

router.get({
    path: '/greetings',
    name: 'Greetings',
    description: 'A short greeting.',
    tags: ['Tests'],
    parameters: {
        query: {
            name: Joi.string()
                .min(2)
                .max(18)
                .invalid('Frank')
                .description('Your name ("Frank" is not allowed)')
        }
    }
}, (req: Request<Record<string, never>, string, Record<string, never>, { name: string }>, res) => {
    return res.send(`Hello ${req.query.name || 'world'}!`)
})

export default routing().use('/tests', router)
