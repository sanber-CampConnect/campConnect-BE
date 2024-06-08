import crypto from "crypto";
import products from "../models/Products.js";
import variants from "../models/Variants.js";
import connection from "../models/DBConnection.js";
import { filterBody, hasEnoughData } from "../utils/requestPreprocessor.js";

const FILLABLES = ["category_id", "name", "image", "description", "price"];
const ASSET_GROUP = "products";

export default {
    index: function(req, res, next) {
        const filter = req.query.category
        const offset = Number(req.query.index) || 0 ;
        const pageSize = 15;

        if(filter == undefined) {
            products.getAll(pageSize, offset)
                .then(result => res.send({ data: result }))
                .catch(err => next(err))
        } else {
            const filters = {"Categories.name": filter};
            products.getAllFiltered(filters, pageSize, offset)
                .then(result => res.send({ data: result }))
                .catch(err => next(err))
        }
    },

    findOne: function(req, res, next) {
        products.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {code: "not_found", msg: "No Product with specified id has found"}
                return res.send({ data: result })
            })
            .catch(err => next(err))
    },
    
    store: function(req, res, next) {
        const productVariants = req.body.variants;

        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != FILLABLES.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }

        const image = req.body.image;
        req.body.image = crypto.randomBytes(32).toString("hex");

        let insertId;
        const data = [ FILLABLES, FILLABLES.map(key => req.body[key])]
        products.store(data)
            .then(result => {
                insertId = result.insertId;
                const variantData = [
                    ["product_id", "name", "stock"],
                    productVariants.map((variant) => [insertId, ...Object.values(variant)])
                ]
                return variants.store(variantData) //uploadImage(image, req.body.image, ASSET_GROUP);
            })
            .then(result => {
                const variantsInsertId = [...Array(result.affectedRows)]
                                        .map( (_, id) => result.insertId + id)
                return res.send({ 
                    msg: `Product created with id:${insertId}`,
                    data: {
                        id: insertId,
                        ...req.body,
                        variants: variantsInsertId.map((id, idx) => ({
                            id: id, ...productVariants[idx]
                        }))
                    }
                })
            })
            .catch(err => (
                err.detail?.code == "ER_DUP_ENTRY"? 
                    next({code: "duplicate_entry", msg: "All of Variant's name should be unique"}) : 
                    next(err)
            ));
    },

    /* WARNING 
        This might be an expensive operation since we have to adjust so that it's 
        suitable with the app flow from Front-End
    */
    edit: function(req, res, next) {
        const productVariants = req.body.variants;

        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != FILLABLES.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }
        
        let tempVariants = undefined
        products.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {code: "not_found", msg: `No Product with id ${req.params.id} found`}
                return variants.products(req.params.id);
            })
            .then(result => {
                /* What remains in `oldVariants` need to be deleted
                    What remains in `newVariants` need to be added */
                tempVariants = result
                const oldVariantFlags = [...Array(tempVariants.length)].map(_ => 0);
                const newVariants = productVariants.filter((variant) => {
                    for(let idx = 0; idx < oldVariantFlags.length; idx++) {
                        const alreadyExist = variant.name == tempVariants[idx].name
                        if(alreadyExist) {
                            oldVariantFlags[idx] = 1
                            return false;
                        }
                    }
                    return true;
                })

                tempVariants = tempVariants.filter((val, idx) => oldVariantFlags[idx] == 0)
                if(newVariants.length != 0) {
                    const variantData = [
                        ["product_id", "name", "stock"],
                        newVariants.map((variant) => [req.params.id, ...Object.values(variant)])
                    ]
                    return variants.store(variantData) //uploadImage(image, req.body.image, ASSET_GROUP);
                }
                return undefined;
            })
            .then(_ => {
                if(tempVariants.length != 0) {
                    return connection.query(
                        [ 
                            "DELETE FROM Variants WHERE",
                            tempVariants.map(idx => "Variants.id = ?")
                                .join(" OR ")
                        ].join(" "),
                        tempVariants.map((val, _) => val.id)
                    )
                }
                return undefined;
            })
            .then(_ => variants.products(req.params.id))
            .then(savedVariants => {
                tempVariants = savedVariants
                return products.updateById(req.params.id, req.body)
            })
            .then(_ => res.send({ 
                msg: `Product edited with id:${req.params.id}`,
                data: {
                    id: Number(req.params.id),
                    ...req.body,
                    variants: tempVariants
                }
            }))
            .catch(err => (
                err.detail?.code == "ER_DUP_ENTRY"? 
                    next({code: "duplicate_entry", msg: "All of Variant's name should be unique"}) : 
                    next(err)
            ));
    },

    destroy: function(req, res, next) {
        products.deleteById(req.params.id)
            .then(result => {
                if(result.affectedRows == 0) throw {code: "not_found", msg: `No Product with id ${req.params.id} found`}
                return res.send({msg: `Deleted Product with id: ${req.params.id}`})
            })
            .catch(err => next(err))
    },
}