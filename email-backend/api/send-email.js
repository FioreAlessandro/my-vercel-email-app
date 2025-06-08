import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, orderDetails } = req.body;

  if (!username || !email || !orderDetails) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // Configura il trasportatore SMTP (usa un account Gmail con password app specifica)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Conferma ordine Cucina di Nonna',
      text: `Ciao ${username},\n\nGrazie per il tuo ordine:\n${orderDetails}\n\nA presto!`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email inviata con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
