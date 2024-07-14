import nodemailer from 'nodemailer';
/*
    para enviar emails é necessário um servidor de emails (smtp) como aws sas (pago), free duas alternativas:
    1 - https://mailtrap.io/ é uma alternativa gratuita apenas para testes
    2 - nodemailer cria um mailtrap (fake) internamente
*/
export async function getMailClient() {
    const account = await nodemailer.createTestAccount()
    // nodemailer utiliza essa ferramenta para testar o envio de email - https://ethereal.email/
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: account.user,
            pass: account.pass
        }
    })

    return transporter;
}