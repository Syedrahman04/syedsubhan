const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const {OAuth2} = google.auth;
const {EMAIL,MAILING_ID,MAILING_SEC,MAILING_REFRESH} = process.env;

const auth = new OAuth2(MAILING_ID, MAILING_SEC)
// send link to active account
exports.sendVerificationEmail = (email,otp) => {
    auth.setCredentials({ refresh_token: MAILING_REFRESH })
    const accessToken = auth.getAccessToken()
    const stmp = new nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: EMAIL,
            clientId: MAILING_ID,
            clientSecret: MAILING_SEC,
            refreshToken: MAILING_REFRESH,
            accessToken : accessToken
        }
    })
    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: 'Verify your potcast email address',
        html: `
        <div style="font-family:Roboto;max-width:700px"><div style="display:flex;align-items:center;font-weight:600;gap:10px;margin-bottom:1rem;color:#3b5995"><img style="width:30px" src="https://res.cloudinary.com/dnbze7unf/image/upload/v1679555101/logo_f5tvqp.png" alt="potcast"><span>Action requies: Verify your Potcast Account</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-weight:700"><div style="font-weight:400;padding:10px 0"><span>You recently create an account on Potcast, To complete your registration, please confirm your account</span></div><div style="display:flex;align-items:center;justify-content:center"><span style="width:200px;padding:10px 15px;background:#4c649b;color:#fff;text-decoration:none;display:flex;align-items:center;justify-content:center">${otp}</span></div><br><span style="font-weight:400">Potcast allow your to stay in touch with all your friends, once refistered on Postcast, you can share your valuable time, orgarnize events and much more.</span></div></div>
        `
    }

    stmp.sendMail(mailOptions, (err, info) => {
        if (err) {
            return err;
        }
        return info;
    });
}
