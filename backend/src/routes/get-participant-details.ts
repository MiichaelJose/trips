import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
//validar entrada de dados com (schemas)
import { z } from 'zod';
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getParticipantDetails(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get("/participants/:participantId", { 
        schema: {
            params: z.object({
                participantId: z.string().uuid()
            })
        }
    }, async (request) => {
        const { participantId } = request.params

        const participant = await prisma.participant.findUnique({
            select: {
                id: true,
                name: true,
                email: true,
                is_confirmed: true  
            },
            where: {
                id: participantId
            }
        })

        if(!participant) {
            throw new ClientError('Trip not Found.')
        }

        return { participant }
    })
}