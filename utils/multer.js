export const imageOnly = function(req, file, callback) {
    if(file.mimetype.startsWith("image/")) callback(null, true)
    else callback(new Error("Only images are allowed"), false)
}
