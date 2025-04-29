import routing from '@novice1/routing'

// home page (/)
export default routing().get('/', (_, res) => {
    return res.send('Hello world!')
})
