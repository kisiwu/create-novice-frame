import request from 'supertest';
import { frame } from '../src/apps/frame';
import TestAgent from 'supertest/lib/agent';

describe('Starting server', function () {

    let agent: TestAgent;

    before(done => {
        frame.build()
        agent = request(frame._app)
        done()
    });

    it('/ (GET)', () => {
        return agent
            .get('/')
            .expect(200)
            .expect('Hello world!');
    });

    it('/tests/greetings?name=Frank (GET)', () => {
        return agent
            .get('/tests/greetings?name=Frank')
            .expect(400);
    });

    it('/tests/greetings?name=everyone (GET)', () => {
        return agent
            .get('/tests/greetings?name=everyone')
            .expect(200)
            .expect('Hello everyone!');
    });
});