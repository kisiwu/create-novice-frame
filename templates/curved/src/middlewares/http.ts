import { ErrorRequestHandler, RequestHandler } from 'express'
import Logger from '@novice1/logger'
import routing from '@novice1/routing'

export const httpError: ErrorRequestHandler = (err, _req, res, _next) => {
    Logger.error(err);
    res.status(500).json({message: 'Something went wrong.', label: 'InternalServerError'});
    return;
}

export const httpNotFound: RequestHandler = (_, res) => {
    res.status(404).json({message: 'The resource was not found.', label: 'NotFound'});
    return;
}

export const validatorOnError: routing.ErrorRequestHandler = (err, _req, res) => {
    const { _original, ...details } = err
    return res.status(400).json({ ...details, message: 'The request was invalid.', label: 'BadRequest' })
}
