import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
//validar entrada de dados com (schemas)
import { z } from 'zod';

export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/confirm", { 
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            })
        }
    }, async (request) => {
        return { tripId: request.params.tripId }
    })
}