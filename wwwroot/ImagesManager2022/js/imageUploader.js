/////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Author: Nicolas Chourot
// october 2022
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// This script generate necessary html control in order to offer an image uploader.
//
// This script is dependant of jquery and jquery validation.
//
//  Example:
//
//  With the following:
//   <div id="photo" class="imageUploader" defaultIamge="images/No_Image.png" waitingimage="images/writing.gif">
//
//
//  We obtain:
/*
    <div id="photo" class="imageUploader" defaultImage="images/No_Image.png" waitingImage="images/writing.gif">

        <div id="photo_imageContainer" class="UploadedImage" 
            style= "background-image: url('images/No_Image.png');...">
        </div>

        <input id="photo_ImageUploader" type=" file"style="visibility:hidden;" 
            accept="image/jpeg, image/jpg, image/gif, image/png, image/bmp, image/webp">

        <input id="photo_Data" style="visibility:hidden;">

    </div>
*/
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// Error messages
let wrongFileFormatMessage = "Ce format d'image n'est pas accepté.";

// Accepted file formats
const acceptedFileFormat = "image/jpeg, image/jpg, image/gif, image/png, image/bmp, image/webp";

$(() => {
    /* you can have more than one file uploader */
    $(".ImageUploader").each(function () {
        ImageUploader.init($(this));
    });
    // Drag & drop handlers
    $(".ImageContainer").on("dragenter", function (e) {
        $(this).css("border", "4px solid blue");
        e.preventDefault();
    });
    $(".ImageContainer").on("dragover", function (e) {
        e.preventDefault();
    });
    $(".ImageContainer").on("dragleave", function (e) {
        $(this).css("border", "4px solid white");
        e.preventDefault();
    });
    $(".ImageContainer").on("drop", (e) => {
        ImageUploader.uploadDroppedImageFile(e);
    });
});

class ImageUploader {
    static init(imageUploader) {
        let id = imageUploader.attr("id");
        imageUploader.css("display", "flex");
        imageUploader.css("flex-direction", "column");
        imageUploader.css("align-items", "center");
        imageUploader.css("padding-top", "6px");
        imageUploader.css("padding-left", "8px");
        imageUploader.css("padding-right", "8px");

        let imageContainer = $(`<div class="ImageContainer" id="${id}_ImageContainer">`);
        imageUploader.append(imageContainer);

        this.setImage(id, imageUploader.attr("defaultImage"));

        let inputFileControl = $('<input type="file" style="visibility:hidden; height:0px;">');
        imageUploader.append(inputFileControl);
        inputFileControl.attr("id", `${id}_ImageUploader`);
        inputFileControl.attr("accept", acceptedFileFormat);

        //let imageDataContainer = $(`<input id=${id}_Data style="visibility:hidden; height:0px;">`);
        let imageDataContainer = $(`<input id=${id}_Data style="height:0px;border:1px solid white; width:1px; margin: auto; position:relative; top:-100px; z-index:-1";>`);
        imageUploader.append(imageDataContainer);

        // one click will be transmitted to #id_ImageUploader
        imageContainer.click(() => {
            inputFileControl.trigger("click");
        });
        imageUploader.on("change", (e) => {
            this.uploadInputImageFile(e);
        });
    }
    static clearImageData(id) {
        $("#" + id).val("");
    }
    static getImageData(id) {
        return $(`#${id}_Data`).val();
    }
    static setImageData(id, value) {
        $(`#${id}_Data`).val(value);
    }
    static getWaitingImage(id) {
        return $(`#${id}`).attr("waitingImage");
    }
    static getImage(id) {
        let target = $(`#${id}_ImageContainer`);
        return target.css("background-image").replace(/^url\(['"](.+)['"]\)/, "$1");
    }
    static imageRequired(id, required) {
        $(`#${id}_Data`).prop('required', required);
    }
    static resetImage(id) {
        let target = $(`#${id}`);
        let url = target.attr("defaultimage");
        this.setImage(id, target.attr("defaultImage"));
        this.clearImageData(id);
    }
    static setImage(id, url) {
        let target = $(`#${id}_ImageContainer`);
        if (url == "")
            url = $(`#${id}`).attr("defaultImage");
        target.css("background-image", `url('${url}')`);
        // position & size of the background image
        target.css("background-position", "center");
        target.css("background-size", "contain");
        target.css("background-repeat", "no-repeat");
        // position & size of the image container
        target.css("flex", "1");
        target.css("height", "100%");
        target.css("width", "100%");
        this.clearImageData(id);
    }
    static validExtension(ext) {
        return acceptedFileFormat.indexOf("/" + ext) > 0;
    }
    static uploadDroppedImageFile(event) {
        // get the dropped image file
        let droppedImageFile = event.originalEvent.dataTransfer.files[0];
        // get the id of the imageUploader
        let id = event.target.id.split("_")[0];
        // store locally the current image
        let previousImage = this.getImage(id);
        // show the waiting image
        this.setImage(id, this.getWaitingImage(id));
        // get the image file extension
        let imageFileExtension = droppedImageFile.name.split(".").pop().toLowerCase();
        // validate the image file extension
        if (!this.validExtension(imageFileExtension)) {
            alert(wrongFileFormatMessage);
            // restore the previous image
            this.setImage(id, previousImage);
        } else {
            // read the dropped image file
            let fileReader = new FileReader();
            fileReader.readAsDataURL(droppedImageFile);
            fileReader.onloadend = () => {
                // get the image file base64 encoding
                let base64ImageData = fileReader.result;
                // set as the current image
                this.setImage(id, base64ImageData);
                // store the image file base64 encoding in the hidden input 
                this.setImageData(id, base64ImageData);
            };
        }
        // erase the border of the image container
        $(`#${id}_ImageContainer`).css("border", "0px solid white");
        event.preventDefault();
        return true;
    }
    static uploadInputImageFile(event) {
        let id = event.target.id.split("_")[0];
        let imageUploader = $(`#${id}_ImageUploader`)[0]; // jquery to DOM
        let previousImage = this.getImage(id);
        this.setImage(id, this.getWaitingImage(id));
        if (!this.validExtension(imageUploader.value.split(".").pop().toLowerCase())) {
            alert(wrongFileFormatMessage);
            setImage(id, previousImage);
        } else {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(imageUploader.files[0]);
            fileReader.onloadend = () => {
                let base64ImageData = fileReader.result;
                this.setImage(id, base64ImageData);
                this.setImageData(id, base64ImageData);
            };
        }
        return true;
    }
}