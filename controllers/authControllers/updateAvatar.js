const { User } = require("../../models");
const path = require("path");
const fs = require("fs/promises");

//! Jimp
const Jimp = require('jimp');


//----------------------------------------------------------------------------------
//! Jimp-2
async function resizeAvatar(tempUpload) {
    //! Read the image.
    const image = await Jimp.read(tempUpload);
    //! 2-вариант
    await image
        .resize(250, 250)
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .writeAsync(tempUpload); //! записывает измененный image во временную папку E:\GoIT\Code\goit-node-hw-05\tmp\
};

//! ПОЛНЫЙ путь к папке назначения всех файлов-аватарок
console.log("");
const avatarsDir = path.join(__dirname, "../../", "public", "avatars");
console.log("ПОЛНЫЙ путь к папке назначения всех файлов-аватарок -> avatarsDir:".bgBlue, avatarsDir.blue); //!;
console.log("");

const updateAvatar = async (req, res) => {
    console.log("ОБЪЕКТ -> req.user:".blue, req.user); //!
    console.log("");

    const { path: tempUpload, destination, originalname } = req.file;
    console.log("ОБЪЕКТ -> req.file:".red, req.file); //!;
    console.log("");
    console.log("ПОЛНЫЙ путь к временной папке tmp -> destination:".bgYellow.black, destination.yellow); //!;
    console.log("");
    console.log("ПОЛНЫЙ путь к ориг. файлу аватара во временной папке tmp -> tempUpload:".bgBlue, tempUpload.red); //!;
    console.log("");

    const { id: userId } = req.user

    const avatarNewName = `${userId}_${originalname}`;
    console.log("avatarNewName:".bgMagenta, avatarNewName.bgGreen.red); //!;
    console.log("");
    console.log("____________________________________________");

    //----------------------------------------------------------------------------
    //! Jimp
    console.log("");
    const avatarNewJimpName = `Jimp_250x250_${avatarNewName}`;
    console.log("avatarNewJimpName:".bgMagenta, avatarNewJimpName.bgGreen.red); //!;
    console.log("");

    //! НЕ НУЖЕН С Jimp
    //! ПОЛНЫЙ путь к новому Jimp-файлу аватара во временной папке tmp
    const avatarTempURL = path.join(destination, avatarNewJimpName);
    console.log("ПОЛНЫЙ путь к новому Jimp-файлу аватара во временной папке tmp -> avatarTempURL:".bgRed, avatarTempURL.bgBlue); //!;


    // async function resizeAvatar() {
    //     const image = await Jimp.read(tempUpload);
    //     await image
    //         .resize(250, 250)
    //         .quality(60) // set JPEG quality
    //         .greyscale() // set greyscale
    //         .writeAsync(avatarTempURL); //! записывает измененный image в E:\GoIT\Code\goit-node-hw-05\tmp\
    // }

    //! Вызов ф-ции Jimp
    await resizeAvatar(tempUpload);

    console.log("");
    console.log("ОБЪЕКТ -> req.file:".red, req.file); //!;
    console.log("");
    //----------------------------------------------------------------------------


    try {
        //! ПОЛНЫЙ путь к новому Jimp-файлу аватара в папке назначения
        // const resultUpload = path.join(avatarsDir, avatarNewName);
        const resultUpload = path.join(avatarsDir, avatarNewJimpName);
        console.log("ПОЛНЫЙ путь к новому Jimp-файлу аватара в папке назначения -> resultUpload:".bgCyan.black, resultUpload.red); //!;
        console.log("");

        //! ПЕРЕИМЕНОВАНИЕ и ПЕРЕМЕЩЕНИЕ файла аватара с временноцй папки tmp в папку назначения E:\GoIT\Code\goit-node-hw-05\public\avatars
        await fs.rename(tempUpload, resultUpload); //! old
        // await fs.rename(tempUpload, avatarTempURL);
        // await fs.rename(avatarTempURL, resultUpload);


        const avatarURL = path.join("public", "avatars", avatarNewJimpName);
        console.log("ОТНОСИТЕЛЬНЫЙ путь к новому Jimp-файлу аватара в папке назначения -> avatarURL:".bgGreen.black, avatarURL.green); //!;
        console.log("");


        await User.findByIdAndUpdate(req.user._id, { avatarURL });
        // await User.findByIdAndUpdate(req.user._id, { avatarURL }, { new: true });

        res.json({ avatarURL });

    } catch (error) {
        await fs.unlink(tempUpload);
        throw error;
    }
};


module.exports = updateAvatar;