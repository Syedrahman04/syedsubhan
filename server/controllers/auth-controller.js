const otpService = require('../services/otp-service');
const hashService = require('../services/hash-service');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const UserDto = require('../dtos/user-dto');
const { sendVerificationEmail } = require('../services/mailer');

class AuthController {
    async sendOtp(req, res) {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Phone field is required!' });
        }
        const otp = await otpService.generateOtp();
        // // const otp = 7777;
        const ttl = 1000 * 60 * 2; // 2 min
        const expires = Date.now() + ttl;
        const data = `${email}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);
        // send OTP
        try {
            sendVerificationEmail(email, otp)
            res.json({
                hash: `${hash}.${expires}`,
                email
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'message sending failed' });
        }
    }

    async verifyOtp(req, res) {
        const { otp, hash, email } = req.body;


        if(!hash || !otp || !email){
            return res.status(404).json({message: "All field are required"});
        }

        // spilit hash and expires
        const [hashOtp, expires] = hash.split('.');

        // otp expires or not
        if(Date.now() > +expires){
            return res.status(404).json({message: "Your otp is expired"});
        }

        // hash data isvalid or not
        const data = `${email}.${otp}.${expires}`;
        const isValid = await otpService.verifyOtp(hashOtp, data);

        if(!isValid){
            return res.status(404).json({message: "Invalid OTP"});
        }

      // create a new user

        let user;
        try{
            user = await userService.findUser({email});
            if(!user){
               user = await userService.createUser({email});
            }
         }catch(err){
            return res.status(404).json({message: "DB Error"});
         }
        // access token and refresh token generate for user
        const {accessToken, refreshToken} = tokenService.generateTokens({
            _id: user._id, activated: user.activated
        });
         // refresh token save in database
        await tokenService.storeRefreshToken(refreshToken, user._id)

      
      // refresh token sav for cookie
      res.cookie('refreshToken', refreshToken,{
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
      })
      res.cookie('accessToken', accessToken,{
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
      })


      res.status(200).json({user,isAuth: true});
    }

    async refresh(req, res) {
        // get refresh token from cookie
        const { refreshToken: refreshTokenFromCookie } = req.cookies;
        // check if token is valid
        let userData;
        try {
            userData = await tokenService.verifyRefreshToken(
                refreshTokenFromCookie
            );
        } catch (err) {
            return res.status(401).json({ message: 'Invalid Token' });
        }
        // Check if token is in db
        try {
            const token = await tokenService.findRefreshToken(
                userData._id,
                refreshTokenFromCookie
            );
            if (!token) {
                return res.status(401).json({ message: 'Invalid token' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }
        // check if valid user
        const user = await userService.findUser({ _id: userData._id });
        if (!user) {
            return res.status(404).json({ message: 'No user' });
        }
        // Generate new tokens
        const { refreshToken, accessToken } = tokenService.generateTokens({
            _id: userData._id,
        });

        // Update refresh token
        try {
            await tokenService.updateRefreshToken(userData._id, refreshToken);
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }
        // put in cookie
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });
        // response
        const userDto = new UserDto(user);
        res.json({ user: userDto, auth: true });
    }

    async logout(req, res) {
        const { refreshToken } = req.cookies;
        // delete refresh token from db
        await tokenService.removeToken(refreshToken);
        // delete cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.json({ user: null, auth: false });
    }
}

module.exports = new AuthController();
