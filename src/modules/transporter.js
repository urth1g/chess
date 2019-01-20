var nodemailer = require('nodemailer');
var { emailStr } = require('./UserScheme.js');
var Link = `http://localhost:3000/register/confirm/${emailStr}`
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'djolecs97@gmail.com',
    pass: 'mobpro1234gG1!'
  }
});

var mailOptions = {
  from: 'djolecs97@gmail.com',
  to: 'email',
  subject: 'ChessCash email verification',
  html: `<h3 style="text-align:center">Verification</h3><p>Please visit this link <a href="${Link}">${Link}</a> to verify your email address and start playing! Best of luck in your upcoming games!</p><p>Sincerely,<br>ChessCash team</p>`
};

module.exports = { transporter, mailOptions }