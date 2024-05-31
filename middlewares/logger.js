export default function log(req, res, next) {
    console.log(`[${new Date()}] ${req.method} - ${req.url}`);
    next();
}