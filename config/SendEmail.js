const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
        user: 'kgimase@gmail.com',
        pass: 'jlvo mkqd dulm mzpr',
      },
    });

    await transporter.sendMail({
      from: 'kgimase@gmail.com',
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Error sending email', error);
  }
};

module.exports = sendEmail;
