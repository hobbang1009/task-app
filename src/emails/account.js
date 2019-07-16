const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const welcomeMessage = (email, name) => {
  sgMail.send({
    to: email,
    from: "hobbang1009@naver.com",
    subject: `Welcome ${name}!`,
    html: `Thank you for Join`
  });
};

const goodbyeMessage = (email, name) => {
  sgMail.send({
    to: email,
    from: "hobbang1009@naver.com",
    subject: `GoodBye ${name}`,
    html: `Thank you and good bye ${name}`
  });
};

module.exports = { welcomeMessage, goodbyeMessage };
