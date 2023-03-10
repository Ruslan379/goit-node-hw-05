const { User } = require("../../models/userModel.js");
const { Conflict } = require("http-errors");

const bcrypt = require("bcryptjs");
//* gravatar
const gravatar = require("gravatar");

const { nanoid } = require("nanoid");

//? ----------------------- SendGrid -----------------------
// const sgMail = require('@sendgrid/mail');
// require("dotenv").config();
// const { SENDGRID_API_KEY, SENDGRID_EMAIL } = process.env;
// sgMail.setApiKey(SENDGRID_API_KEY);
// // sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { sendVerificationEmailSendGrid } = require("../../helpers");
//? _______________________ SendGrid _______________________

//todo ------------------- Nodemailer -------------------
// const nodemailer = require("nodemailer");
// require("dotenv").config();
// const { META_EMAIL, META_PASSWORD } = process.env;

const { sendVerificationEmailNodemailer } = require("../../helpers");
//todo ___________________ Nodemailer ____________________


//-----------------------------------------------------------------------------
const registrationController = async (req, res) => {
    const { email, password } = req.body;
    const userMailCheck = await User.findOne({ email });

    //! ПРОВЕРКА - если email уже используется кем-то другим:
    if (userMailCheck) {
        throw new Conflict(`Email ${email} in use`)
    }

    //! ------------------------ Хеширование и засолка password --------------------------
    //? 1-вариант
    //! Пароль в явном виде (если не используется хеширование и засолка в userSchema (1 вариант))
    // const newUser = await User.create({ email, password }); 

    //? 2-вариант (самый простой)
    //!  Хеширование и засолка password с помошью bcryptjs (или bcrypt)
    // const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    // const newUser = await User.create({ email, password: hashPassword }); 

    //* gravatar
    // const avatarURL = gravatar.url(email);
    // const avatarURL = gravatar.url(email, { protocol: 'https', d: 'retro' });
    // const avatarURL = gravatar.url(email, { protocol: 'https', s: '32', d: 'retro' });
    const avatarURL = gravatar.url(email, { protocol: 'https', d: 'robohash' });

    //? ------------------- SendGrid -------------------
    //todo ------------------- Nodemailer -------------------
    const verificationToken = nanoid();
    console.log("");
    console.log("verificationToken:".bgRed.white, verificationToken.red); //!


    //? 3-вариант (самый сложный)
    //!  Хеширование и засока password с помошью bcryptjs (или bcrypt) используется в userSchema
    const newUser = new User({ email, avatarURL, verificationToken }); //* gravatar + SendGrid or Nodemailer
    await newUser.setPassword(password);
    await newUser.save();
    //! _______________________ Хеширование и засолка password _________________________


    console.log("\nnewUser:".green, newUser); //!
    console.log("");






    //? ------------------- SendGrid -------------------
    const dataSendGrid = {
        to: email,
        // from: SENDGRID_EMAIL, // Use the email address or domain you verified above
        subject: 'Thank you for registration with SendGrid-5!',
        text: '...and easy to do anywhere, even with Node.js and SendGrid',
        html: '<h1>...and easy to do anywhere, even with Node.js and SendGrid</h1>',
    };
    // await sendVerificationEmailSendGrid(dataSendGrid); //! отправка подтверждениия (верификации) на email пользователя

    //? OLD
    // const msg = {
    //     to: email,
    //     from: SENDGRID_EMAIL, //? Use the email address or domain you verified above
    //     subject: 'Thank you for registration with SendGrid-5!',
    //     text: '...and easy to do anywhere, even with Node.js and SendGrid',
    //     html: '<h1>...and easy to do anywhere, even with Node.js and SendGrid</h1>',
    // };
    // await sgMail.send(msg);
    // console.log("Email send using SendGrid success!".bgGreen.black);
    // console.log("");
    //? ___________________ SendGrid ____________________


    //todo ------------------- Nodemailer -------------------
    // // Объект конфигурации META:
    // const nodemalierConfig = {
    //     host: "smtp.meta.ua",
    //     port: 465, // 25, 465, 2255
    //     secure: true,
    //     auth: {
    //         user: META_EMAIL,
    //         pass: META_PASSWORD,
    //     }
    // };

    // const transporter = nodemailer.createTransport(nodemalierConfig);

    const dataNodemailer = {
        to: email,
        // from: META_EMAIL, //? Use the email address or domain you verified above
        // subject: 'Thank you for registration with Nodemailer-8!',
        subject: 'Подтверждение регистрации на сайте-3',
        // text: '...and easy to do anywhere, even with Node.js and Nodemailer',
        // html: '<h1>...and easy to do anywhere, even with Node.js and Nodemailer</h1>',
        html: `<a href = "http://localhost:3000/api/users/verify/${verificationToken}" target="_blank">Нажмите для подтверждения вашего EMAIL</a>`,
    };

    // await transporter.sendMail(dataNodemailer);
    // console.log("Email send using Nodemailer success!".bgCyan.black);
    // console.log("");
    // // .then(() => console.log("Email send using Nodemailer success!".bgCyan.black))
    // // .catch(error => console.log(error.message));

    // await sendVerificationEmailNodemailer(dataNodemailer); //! отправка подтверждениия (верификации) на email пользователя
    //todo ___________________ Nodemailer ____________________






    //? ------------------ SendGrid -------------------
    //todo -------------- Nodemailer ------------------
    //! Отправка письма
    const mail = {
        to: email,
        // from: META_EMAIL, //? Use the email address or domain you verified above
        // from: SENDGRID_EMAIL, //? Use the email address or domain you verified above
        subject: 'Подтверждение регистрации на сайте_18-3',
        // text: '...and easy to do anywhere, even with Node.js and Nodemailer',
        html: `<a href = "http://localhost:3000/api/users/verify/${verificationToken}" target="_blank">Нажмите для подтверждения вашего EMAIL</a>`,
    };

    //? ------------------ SendGrid -------------------
    await sendVerificationEmailSendGrid(mail); //! отправка подтверждениия (верификации) на email пользователя

    //todo -------------- Nodemailer ------------------
    // await sendVerificationEmailNodemailer(mail); //! отправка подтверждениия (верификации) на email пользователя


    res.status(201).json({
        // status: "success",
        code: 201,
        user: {
            email,
            subscription: newUser.subscription,
            avatarURL //* gravatar
        }
    });
};

module.exports = registrationController;


