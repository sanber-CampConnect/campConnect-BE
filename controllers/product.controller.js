import { unlink } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

import Products from "../models/Products.js";
import Variants from "../models/Variants.js";
import connection from "../models/DBConnection.js";
import { filterBody, hasEnoughData } from "../utils/requestPreprocessor.js";

dotenv.config();
const FILLABLES = ["category_id", "name", "image", "description", "price"];

export default {
    index: function(req, res, next) {
        const filter = req.query.category
        const offset = Number(req.query.index) || 0 ;
        const pageSize = 15;

        if(filter == undefined) {
            Products.getAll(pageSize, offset)
                .then(result => res.send({ data: result }))
                .catch(err => next(err))
        } else {
            const filters = {"Categories.name": filter};
            Products.getAllFiltered(filters, pageSize, offset)
                .then(result => res.send({ data: result }))
                .catch(err => next(err))
        }
    },

    findOne: function(req, res, next) {
        let product = undefined;
        Products.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {code: "not_found", msg: "No Product with specified id has found"}
                product = result[0];
                return Variants.products(req.params.id);
            })
            .then(variants => {
                return res.send({ 
                    data: {
                        ...product,
                        variants: variants
                    }
                })
            })
            .catch(err => next(err))
    },
    
    store: function(req, res, next) {
        const productVariants = req.body.variants;
        req.body.image = req.imagePath

        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != FILLABLES.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }


        let insertId;
        const data = [ FILLABLES, FILLABLES.map(key => req.body[key])]
        Products.store(data)
            .then(result => {
                insertId = result.insertId;
                const variantData = [
                    ["product_id", "name", "stock"],
                    productVariants.map(variant => [insertId, variant.name, variant.stock])
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
        Products.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {code: "not_found", msg: `No Product with id ${req.params.id} found`}
                req.body.image = req.imagePath == undefined? result[0].image: req.imagePath;

                if(result[0].image != null && req.imagePath != undefined) {
                    return unlink(path.join(process.env.STORAGE_PATH, result[0].image))
                } 
                return undefined;
            })
            .then(_ => variants.products(req.params.id))
            .then(result => {
                /* What remained in `tempVariants` need to be deleted
                    What remained in `newVariants` need to be added */
                if(result.length != 0) {
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
                }
                return undefined;
            })
            .then(_ => {
                if(tempVariants?.length != 0) {
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
                return Products.updateById(req.params.id, req.body)
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
        Products.getById(req.params.id)
            .then(result => {
                if(result.length === 0) throw {code: "not_found", msg: `No Product with id ${req.params.id} found`};
                if(result[0].image != null) return unlink(path.join(process.env.STORAGE_PATH, result[0].image))
                return undefined;
            })
            .then(_ => Products.deleteById(req.params.id))
            .then(_ =>  res.send({ msg: `Deleted Product with id: ${req.params.id}` }))
            .catch(err => next(err));
    },
}