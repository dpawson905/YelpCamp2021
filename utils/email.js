const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const ejs = require("ejs");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.username = user.username;
    this.url = url;
    this.from = `${process.env.NAME} <${process.env.EMAIL_FROM}>`;
  }

  async send(template, subject) {
    let emailTemplate;
    ejs
      .renderFile(`${__dirname}/../views/email/${template}.ejs`, {
        username: this.username,
        url: this.url,
        subject,
      })
      .then(async (result) => {
        emailTemplate = result;
        const mailOptions = {
          from: this.from,
          to: this.to,
          subject,
          html: emailTemplate,
          text: htmlToText.convert(emailTemplate),
        };
        await sgMail.send(mailOptions);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the YelpCamp Family");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
