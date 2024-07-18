import type { FastifyInstance } from "fastify";

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
    return reply.status(400).send({ message: error.message })
}
