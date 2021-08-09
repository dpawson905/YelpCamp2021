const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const ejs = require('ejs');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.from = `${process.env.NAME} <${process.env.EMAIL_FROM}>`;
  }

  async send(template, subject) {
    const html = ejs.renderFile(
      `${__dirname}/../views/emails/${template}.ejs`,
      {
        url: this.url,
        subject,
      }
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    await sgMail.send(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the YelpCamp Family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};