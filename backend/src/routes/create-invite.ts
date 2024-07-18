import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
//validar entrada de dados com (schemas)
import { z } from 'zod';
import { prisma } from "../lib/prisma";
import nodemailer from 'nodemailer';
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function createInvite(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/trips/:tripId/invites", { 
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                email: z.string().email()
            })
        }
    }, async (request) => {
        const { tripId } = request.params
        const { email } = request.body

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        })

        if(!trip) {
            throw new ClientError('Trip not Found.')
        }

        const participant = await prisma.participant.create({
            data: {
                email,
                tripId: tripId
            }
        })

        const fomattedStartDate = dayjs(trip.starts_at).format("LL")
        const fomattedEndDate = dayjs(trip.starts_at).format("LL")
    
        const mail = await getMailClient()

        const confirmationLink = `${env.WEB_BASE_URL}/participants/${participant.id}/confirm`

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

        return { participant: participant.id }
    })
}