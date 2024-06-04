import nodemailer from "nodemailer";
import dotenv from "dotenv";
import config from "../configs/nodemailer.js";

dotenv.config();

export default {
    sendMail: function(destination, subject, content, onError) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: config.auth
        })

        const mailOptions = {
            from: config.auth.user,
            to: destination,
            subject: subject,
            text: content,
        };

        transporter.sendMail(mailOptions, onError)
    }
} 