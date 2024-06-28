export default function isAdmin(req, res, next) {
    if(req.user.role != "admin") {
        return next({
            code: "no_role_permission", 
            message: "You need the `admin` role"
        });
    }

    return next();
}