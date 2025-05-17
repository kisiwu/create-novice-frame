import routing from '@novice1/routing'
import { controller } from '@novice1/frame'

// home page (/)
export default routing().get({
    path: '/',
    name: 'Homepage',
    description: 'Homepage'
}, controller(
    async () => 'Hello world!'
))
