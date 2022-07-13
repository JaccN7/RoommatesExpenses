const nodemailer = require('nodemailer');

const createTrans = () => {
    const transport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: "b584018186a9f1",
            pass: "0b3f59b281af0b"
        }
    });
    return transport;
}

const sendMail = async () => {
    const transporter = createTrans();
    const info = await transporter.sendMail({
        from: '"Admin Roommates" <xxz45@example.com>',
        to: "usuario77qaz@exampleuser.com",
        subject: "Nuevo rooomate",
        html: "<h2>Hola</h2>" + 
        "<p>Sabemos que es importante para ti, por lo que te informamos que se ha sumado un nuevo integrante a tu lista de Roommates Expenses</p>" +
        "<p>Recuerda darle la Bienvenida</p>"
    });
    console.log(`Message sent: ${info.messageId}`);
    return 
}

module.exports = sendMail ;