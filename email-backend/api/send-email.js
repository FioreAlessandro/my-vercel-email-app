AILimport nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, orderDetails } = req.body;

  if (!username || !email || !orderDetails) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Configura il trasportatore SMTP (es. Gmail, Mailtrap, o altro)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,     // es. smtp.gmail.com
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,                   // true per 465, false per altri port
    auth: {
      user: process.env.EMAIL,  // tua email o user SMTP
      pass: process.env.PASSWORD,  // password SMTP o app password
    },
  });

  const mailOptions = {
    from: `"Cucina di Nonna" <${process.env.SMTP_USER}>`,
    to: email, // manda all’utente che ha ordinato
    subject: `Conferma ordine per ${username}`,
    text: `Ciao ${username},\n\nGrazie per il tuo ordine:\n\n${orderDetails}\n\nA presto!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email inviata con successo' });
  } catch (error) {
    console.error('Errore invio email:', error);
    res.status(500).json({ error: 'Errore invio email' });
  }
}

