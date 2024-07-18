import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
//validar entrada de dados com (schemas)
import { z } from 'zod';
import { prisma } from "../lib/prisma";
import { dayjs } from '../lib/dayjs';

export async function updateTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().put("/trips/:tripId", { 
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(), // tenta converter o formato string para date
                ends_at: z.coerce.date(),   // javascript nao consegue passar um object
            })
        }
    }, async (request) => {
        const { tripId } = request.params	
        const { destination, ends_at, starts_at }  = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        })

        if(!trip) {
            throw new Error('Trip not Found.')
        }
        //retorna erro se a data de inico for antes da data atual
        if(dayjs(starts_at).isBefore(new Date())) {
            throw new Error("invalid trip start date")
        }

        if(dayjs(ends_at).isBefore(new Date())) {
            throw new Error("invalid trip end date")
        }

        await prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                destination,
                starts_at,
                ends_at
            }
        })

        return { tripId: trip.id };
    })
}
