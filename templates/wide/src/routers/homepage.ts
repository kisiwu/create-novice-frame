import routing from '@novice1/routing'

// home page (/)
export default routing().get({
    path: '/',
    name: 'Homepage',
    description: 'Homepage'
}, (_, res) => {
    return res.send('Hello world!')
})
