import dotenv from "dotenv";
dotenv.config();

// Need help setting up?
// Refer: https://www.freecodecamp.org/news/use-nodemailer-to-send-emails-from-your-node-js-server/
export default {
    auth: {
        type: 'OAuth2',
        user: process.env.SYSTEM_MAIL_ADDRESS,
        pass: process.env.SYSTEM_MAIL_PASS,
        clientId: process.env.SYSTEM_MAIL_OAUTH_CLIENT_ID,
        clientSecret: process.env.SYSTEM_MAIL_OAUTH_CLIENT_SECRET,
        refreshToken: process.env.SYSTEM_MAIL_OAUTH_REFRESH_TOKEN
    }
};