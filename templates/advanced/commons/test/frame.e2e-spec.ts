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

    it('/tests/greet (GET)', () => {
        return agent
            .get('/tests/greet')
            .expect(200)
            .expect('Hello world!');
    });

    it('/tests/greet?name=Frank (GET)', () => {
        return agent
            .get('/tests/greet?name=Frank')
            .expect(400);
    });

    it('/tests/greet?name=everyone (GET)', () => {
        return agent
            .get('/tests/greet?name=everyone')
            .expect(200)
            .expect('Hello everyone!');
    });

    it('/tests/greet?name=everyone&greeting=Hi (GET)', () => {
        return agent
            .get('/tests/greet?name=everyone&greeting=Hi')
            .expect(200)
            .expect('Hi everyone!');
    });

    it('/tests/greet?name=everyone&greeting=Salute (GET)', () => {
        return agent
            .get('/tests/greet?name=everyone&greeting=Salute')
            .expect(400);
    });
});