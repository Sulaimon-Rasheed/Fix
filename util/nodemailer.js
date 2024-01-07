const nodemailer = require("nodemailer")
require("dotenv").config()

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.AUTH_MAIL,
        pass:process.env.AUTH_PASS
    }
})

const sendEmail = async (option)=>{
   await transporter.sendMail({
        from:process.env.AUTH_MAIL,
        to:option.email,
        subject:option.subject,
        html:option.html
    })
}

module.exports = {sendEmail}