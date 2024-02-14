import { handler } from 'protolib/api'
import { Protofy } from 'protolib/base'
// import { Application } from 'express';
// import { getLogger } from "protolib/base"
const formData = require('form-data');
const Mailgun = require('mailgun.js');

// const logger = getLogger()

Protofy("type", "CustomAPI")

const mailgun = new Mailgun(formData);

// Store your Api_key and domain in your root .env file
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY, url: 'https://api.eu.mailgun.net', domain: process.env.MAILGUN_DOMAIN });

export default (app, { devicePub, deviceSub, mqtt }) => {
    app.get('/api/v1/mailgun/send', handler(async (req, res, session, next) => {
        try {
            const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
                from: "Mailgun Sandbox <postmaster@mail.protofy.xyz>",
                to: ["genis@protofy.xyz"],
                subject: "Hello v3",
                text: "Testing some Mailgun awesomeness!",
                html: "<h1>Testing some Mailgun awesomeness!</h1>"
            })
            res.send({ message: "Email sent successfully", id: response.id, response: response });

        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Failed to send email", error: error });
        }
    }))
}

