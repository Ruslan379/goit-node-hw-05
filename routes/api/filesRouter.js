const express = require('express')
const router = express.Router()

const multer = require('multer')
const path = require('path')
const { v4: uuidV4 } = require('uuid')

const { controllerWrapper, authMiddleware } = require("../../middlewares")

const { filesControllers: ctrl } = require("../../controllers")

const { resizeAvatarJimp } = require("../../helpers")


//----------------------------------------------------------------------------
//! 0. Проверка токена
// router.use(authMiddleware);


const FILE_DIR = path.resolve("./public/output")
console.log("ПОЛНЫЙ путь к папке назначения всех файлов-аватарок -> FILE_DIR:".bgCyan.black, FILE_DIR.cyan); //!;
console.log("");

let avatarNewJimpName = ""


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, FILE_DIR)
    },
    filename: (req, file, cb) => {
        //! так можно перезаписать файл при повторной загруке одного и того же файла
        // const [filename, extension] = file.originalname.split(".");
        // cb(null, `${filename}.${extension}`);
        //! чтобы избежать одинаковые названия файлов при повторной загруке одного и того же файла
        const [filename, extension] = file.originalname.split(".");
        const avatarNewName = `${filename + "_" + uuidV4()}.${extension}`
        avatarNewJimpName = `Jimp_250x250_${avatarNewName}`;
        console.log("avatarNewJimpName:".bgBlue, avatarNewJimpName.blue); //!;

        //! ПОЛНЫЙ путь к новому Jimp-файлу аватара во временной папке tmp
        const avatarTempURL = path.join(FILE_DIR, avatarNewJimpName);
        console.log("ПОЛНЫЙ путь к новому Jimp-файлу аватара во временной папке tmp -> avatarTempURL:".bgRed, avatarTempURL.bgBlue); //!;

        // cb(null, `${filename + "_" + uuidV4()}.${extension}`);
        cb(null, avatarNewJimpName);
    },
    limits: {
        // fileSize: 11048576,
    },
});

const uploadMiddleware = multer({ storage });

//! ПОЛНЫЙ путь к новому Jimp-файлу аватара во временной папке tmp
const avatarTempURL = path.join(FILE_DIR, avatarNewJimpName);
console.log("ПОЛНЫЙ путь к новому Jimp-файлу аватара во временной папке tmp -> avatarTempURL:".bgRed, avatarTempURL.bgBlue); //!;

//! Вызов ф-ции Jimp
async () => {

    await resizeAvatarJimp(avatarTempURL)
};

//! 1. POST --> api/files/upload
//? content-type: multipart/form-data
router.post("/upload", uploadMiddleware.single("avatar"), controllerWrapper(ctrl.uploadController))

//! 2. use --> api/files/download
// router.get("/download", express.static(FILE_DIR)) //! так НЕ РАБОТАЕТ!!! --> "Route not found"
router.use("/download", express.static(FILE_DIR))



// module.exports = { authRouter: router }
module.exports = router
