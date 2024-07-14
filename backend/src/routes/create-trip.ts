import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
//validar entrada de dados com (schemas)
import { prisma } from "../lib/prisma";
import { z } from 'zod';
import dayjs from 'dayjs'
import localizedFormat from "dayjs/plugin/localizedFormat"
import 'dayjs/locale/pt-br';
import nodemailer from 'nodemailer'
import { getMailClient } from "../lib/mail";

dayjs.extend(localizedFormat)
dayjs.locale('pt-br')

export async function createTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("/trips", { 
        schema: {
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(), // tenta converter o formato string para date
                ends_at: z.coerce.date(),   // javascript nao consegue passar um object
                owner_name: z.string(),
                owner_email: z.string(),
                emails_to_invite: z.array(z.string().email()),
            })
        }
    }, async (request) => {
        const { destination, ends_at, starts_at, owner_name, owner_email, emails_to_invite}  = request.body;
        //retorna erro se a data de inico for antes da data atual
        if(dayjs(starts_at).isBefore(new Date())) {
            throw new Error("invalid trip start date")
        }

        if(dayjs(ends_at).isBefore(new Date())) {
            throw new Error("invalid trip end date")
        }

        const trip = await prisma.trip.create({
            data: {
                destination,
                starts_at,
                ends_at,
                participants: {
                    createMany: {
                        data: [
                            {
                                name: owner_name,
                                email: owner_email,
                                is_owner: true,
                                is_confirmed: true
                            },
                            ...emails_to_invite.map(email => { // estou concatenando este array do do array data
                                return { email }
                            })
                        ]
                    }
                }
            }
        });

        const fomattedStartDate = dayjs(starts_at).format("LL")
        const fomattedEndDate = dayjs(starts_at).format("LL")
    
        const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm`

        const mail = await getMailClient()

        const message = await mail.sendMail({
            from: {
                name: "equipe planer",
                address: 'oi@gmail.com'
            },
            to: {
                name: owner_name,
                address: owner_email
            },
            subject: `Confirme sua viagem para ${destination} em ${fomattedStartDate}`,
            html: `
                <p>Você solicitou a criação de uma viagem para ${destination} nas datas de <strong>${fomattedStartDate}</strong> até <strong>${fomattedEndDate}</strong>.</p>
                
                <p>Para confirmar sua viagem, clique no link abaixo:</p>
                
                <p><a href="${confirmationLink}">Confirmar viagem</a></p>
                
                <p>Caso esteja usando o dispositivo móvel, você também pode confirmar a criação da viagem pelos aplicativos:</p>
                
                <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
            `.trim()
        })
        //visualizar link do etherium
        console.log(nodemailer.getTestMessageUrl(message));
        
        return trip;
    })
}