export const imageOnly = function(req, file, callback) {
    if(file.mimetype.startsWith("image/")) callback(null, true)
    else {
        console.log("Non-image file uploaded")
        callback(new Error("Only images are allowed"), false)
    }
}
