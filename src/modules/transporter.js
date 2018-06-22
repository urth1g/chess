var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'djolecs97@gmail.com',
    pass: 'mobpro1!GG'
  }
});

var mailOptions = {
  from: 'djolecs97@gmail.com',
  to: 'djordje3g@yahoo.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

module.exports = { transporter, mailOptions }