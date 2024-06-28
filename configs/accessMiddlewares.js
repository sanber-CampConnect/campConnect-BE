import authJwt from "../middlewares/authJwt.js";
import isAdmin from "../middlewares/isAdmin.js";

export const authenticated_only_middlewares = [authJwt]

export const admin_only_middlewares = [ 
    ...authenticated_only_middlewares,
    isAdmin
]