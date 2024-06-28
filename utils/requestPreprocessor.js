export const filterBody = function(req, allowedFields) {
    Object.keys(req.body).forEach(key => {
        if(!allowedFields.includes(key)) delete req.body[key]
    })
}

export const hasEnoughData = function(req, dataCount = 1, onFailure) {
    return req.body.length >= dataCount
}