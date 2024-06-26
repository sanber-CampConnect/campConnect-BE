export default {
    // ::::::::::::::::::::::::: 4xx family :::::::::::::::::::::::::
    "bad_request": {
        status_code: 400, 
        msg: "Server couldn't process the given request"
    },
    "incomplete_request": {
        status_code: 400, 
        msg: "Request doesn't have enough data to be processed by server"
    },
    "duplicate_entry": {
        status_code: 400,
        msg: "Server received a duplicate of duplicate-constrained data"
    },
    "insufficient_stock": {
        status_code: 400,
        msg: "One or more CartItems ordered doesn't have enough stock in store"
    },
    "unmatched_credentials": {
        status_code: 401, 
        msg: "Credentials given doesn't match"
    },
    "no_token": {
        status_code: 401, 
        msg: "Access token needed"
    },
    "invalid_token": {
        status_code: 401, 
        msg: "Access token invalid"
    },
    "no_role_permission": {
        status_code: 403, 
        msg: "Access prohibited because requester has no role permission"
    },
    "not_owner": {
        status_code: 403, 
        msg: "Access prohibited to non-owner"
    },
    "not_verified": {
        status_code: 403, 
        msg: "Account verification is needed"
    },
    "illegal_operation": {
        status_code: 403, 
        msg: "Operaion is not allowed to be done to this resource"
    },
    "not_found": {
        status_code: 404,
        msg: "Requested resource not found"
    },
    
    // ::::::::::::::::::::::::: 5xx family :::::::::::::::::::::::::
    "sql_error": {
        status_code: 500,
        msg: "An error occcured during database operation"
    },
    "internal_error": {
        status_code: 500,
        msg: "Unknown internal server error occured"
    },
}