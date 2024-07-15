import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
//validar entrada de dados com (schemas)
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { dayjs } from '../lib/dayjs';
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";

export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/confirm", { 
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            })
        }
    }, async (request, reply) => {
        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {
                participants: {
                    where: {
                        is_owner: false
                    }
                }
            }
        })

        if(!trip) {
            throw new Error('Trip not found!')
        }
        // se confirmado para viagem, redirecionar para outro lugar no front
        if(trip.is_confirmed) {
            return reply.redirect(`http://localhost:3000/trips/${tripId}`)
        }
        
        await prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                is_confirmed: true
            }
        })

        const fomattedStartDate = dayjs(trip.starts_at).format("LL")
        const fomattedEndDate = dayjs(trip.starts_at).format("LL")
    

        const mail = await getMailClient()

        await Promise.all(
            trip.participants.map(async (participant) => {
                const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`

                const message = await mail.sendMail({
                    from: {
                        name: "equipe planer",
                        address: 'oi@gmail.com'
                    },
                    to: participant.email,  
                    subject: `Confirme sua viagem para ${trip.destination} em ${fomattedStartDate}`,
                    html: `
                        <p>Você convidado para participar de uma viagem para ${trip.destination} nas datas de <strong>${fomattedStartDate}</strong> até <strong>${fomattedEndDate}</strong>.</p>
                        
                        <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
                        
                        <p><a href="${confirmationLink}">Confirmar viagem</a></p>
                        
                        <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
                    `.trim()
                })

                console.log(nodemailer.getTestMessageUrl(message));
            })
        )

        return reply.redirect(`http://localhost:3000/trips/${tripId}`)
    })
}