const fs = require('fs');
var clc = require("cli-color");

module.exports =
    class ImageFilesRepository {

        static getServerImageFilesFolder() {
            return "./wwwroot/images/";
        }
        static getImageFilesFolder() {
            return "/images/";
        }
        static getImageFileURL(GUID) {
            if (GUID != "")
                return this.getImageFilesFolder() + GUID + ".png";
            return "";
        }
        static getThumbnailFileURL(GUID) {
            if (GUID != "")
                return this.getImageFilesFolder() + "thumbnails/" + GUID + ".png";
            return "";
        }
        static getServerImageFileURL(GUID) {
            return this.getServerImageFilesFolder() + GUID + ".png";
        }
        static getServerThumbnailFileURL(GUID) {
            return this.getServerImageFilesFolder() + "thumbnails/" + GUID + ".png";
        }
        static removeImageFile(GUID) {
            if (GUID != "") {
                try {
                    fs.unlinkSync(this.getServerImageFileURL(GUID));
                    fs.unlinkSync(this.getServerThumbnailFileURL(GUID));
                } catch (err) {
                    console.log('image not found');
                }
            }
        }
        static storeImageData(previousGUID, imageDataBase64) {
            if (imageDataBase64) {

                // Remove MIME specifier
                imageDataBase64 = imageDataBase64.split("base64,").pop();

                //https://javascript.plainenglish.io/resize-an-image-using-nodejs-f5e57ac10419
                const sharp = require('sharp');
                const thumbnailSize = 256;
                const { v1: uuidv1 } = require('uuid');

                // remove previous image
                this.removeImageFile(previousGUID);

                // get a new GUID
                let GUID = uuidv1();

                // Store new image file in images folder
                let imageDataBinary = new Buffer.from(imageDataBase64, 'base64');
                fs.writeFileSync(this.getServerImageFileURL(GUID), imageDataBinary);

                // Resize & store new image file in thumbnails folder
                // compute thumbnail resizes dimension keeping proportion of original size
                var sizeOf = require('image-size');
                var dimensions = sizeOf(this.getServerImageFileURL(GUID));
                let newHeight = 0;
                let newWidth = 0;
                if (dimensions.height > dimensions.width) {
                    newWidth = Math.round(dimensions.width * thumbnailSize / dimensions.height);
                    newHeight = thumbnailSize;
                } else {
                    newHeight = Math.round(dimensions.height * thumbnailSize / dimensions.width);
                    newWidth = thumbnailSize;
                }
                sharp(this.getServerImageFileURL(GUID))
                    .resize(newWidth, newHeight)
                    .toFile(this.getServerThumbnailFileURL(GUID))
                    .then(() => {console.log("file resized") })
                    .catch(err => {
                        console.log(err)
                    })
                return GUID;
            } else
                return previousGUID;
        }
    }