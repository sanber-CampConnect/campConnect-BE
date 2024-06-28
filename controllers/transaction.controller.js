import { unlink } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

import DBConnection from "../models/DBConnection.js";
import Transactions from "../models/Transactions.js";
import Users from "../models/Users.js";
import mailService from "../services/mail.service.js";
import Orders from "../models/Orders.js";
dotenv.config()

export default {
    index: function(req, res, next) {
        Transactions.getAll()
            .then(result => res.send({ data: result }))
            .catch(err => next(err))
    },

    findOne: function(req, res, next) {
        Transactions.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found", 
                    msg: "No Transaction with specified id has found"
                }
                return res.send({ data: result[0] })
            })
            .catch(err => next(err))
    },
    
    acceptEvidence: function(req, res, next) {
        let oldTransaction;
        let associatedOrder;
        Transactions.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found", 
                    msg: `No Transaction with id ${req.params.id} found`
                }

                oldTransaction = result[0]
                if(oldTransaction.status == "disetujui") throw {
                    code: "illegal_operation",
                    msg: `Accepted Transaction couldn't be edited again`
                }

                const sql = "SELECT * FROM OrderItems WHERE order_id = ?";
                return DBConnection.query(sql, [oldTransaction.order_id])
            })
            .then(orderItems => {
                const orderInfo = [];
                orderItems.forEach(orderItem => {
                    orderInfo.push(orderItem.id);
                    orderInfo.push(orderItem.rent_duration);
                })

                // Make rent records
                const sql = [
                    "INSERT INTO Rents(??)",
                        "VALUES",
                        orderItems.map(_ => "(?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY))") .join(", ")
                ].join(" ")
                const data = [ ["orderItem_id", "rent_start", "rent_due"], ...orderInfo]
                return DBConnection.query(sql, data)
            })
            .then(_ => { // Update transaction record
                oldTransaction.status = "disetujui"
                oldTransaction.note = req.body.note
                return Transactions.updateById(oldTransaction.id, oldTransaction);
            })
            .then(_ => Orders.getById(oldTransaction.order_id))
            .then(result => { // Update order's info while getting user's id for sending email
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `Order with id ${oldTransaction.orderInfo} somehow not found during transaction update process`
                }

                associatedOrder = result[0]
                return Orders.updateById(associatedOrder.id, {status: "sedang_disewa"})
            })
            .then(_ => Users.getById(associatedOrder.user_id))
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `User who owns Order with id ${oldTransaction.order_id} somehow not found during transaction update process`
                }

                // Send notification mail
                const orderOwner = result[0]
                const {destination, subject, content} = composeTransactionUpdateEmail(orderOwner.email, oldTransaction)
                mailService.sendMail(destination, subject, content, (err, data) => {
                    if(err) {
                        console.log("Notification email not sent")
                        console.log(err)
                    }
                });
                
                return res.status(201).send({
                    msg: `Status of Transaction with id ${req.params.id} successfully updated`,
                    data: oldTransaction
                })
            })
            .catch(err => next(err))
    },

    rejectEvidence: function(req, res, next) {
        let oldTransaction;
        let associatedOrder;
        Transactions.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found", 
                    msg: `No Transaction with id ${req.params.id} found`
                }

                oldTransaction = result[0]
                if(oldTransaction.status == "disetujui") throw {
                    code: "illegal_operation",
                    msg: `Accepted Transaction couldn't be edited again`
                }
            })
            .then(_ => { // Update transaction record
                oldTransaction.status = "ditolak";
                oldTransaction.note = req.body.note
                return Transactions.updateById(oldTransaction.id, oldTransaction);
            })
            .then(_ => Orders.getById(oldTransaction.order_id))
            .then(result => { // Update order's info while getting user's id for sending email
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `Order with id ${oldTransaction.orderInfo} somehow not found during transaction update process`
                }

                associatedOrder = result[0]
                return Users.getById(associatedOrder.user_id)
            })
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `User who owns Order with id ${oldTransaction.order_id} somehow not found during transaction update process`
                }

                // Send notification mail
                const orderOwner = result[0]
                const {destination, subject, content} = composeTransactionUpdateEmail(orderOwner.email, oldTransaction)
                mailService.sendMail(destination, subject, content, (err, data) => {
                    if(err) {
                        console.log("Notification email not sent")
                        console.log(err)
                    }
                });
                
                return res.status(201).send({
                    msg: `Status of Transaction with id ${req.params.id} successfully updated`,
                    data: oldTransaction
                })
            })
            .catch(err => next(err))

    },

    updateEvidence: function(req, res, next) {
        const imagePath = req.imagePath
        if(imagePath == undefined) return next({
            code: "incomplete_request",
            msg: "No evidence image being uploaded"
        })

        let oldTransaction;
        Transactions.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found", 
                    msg: `No Transaction with id ${req.params.id} found`
                }

                oldTransaction = result[0];
                if(oldTransaction.status == "disetujui") throw {
                    code: "illegal_operation",
                    msg: "Accepted transaction doesn't need to be updated"
                }

                return (oldTransaction.evidence_image != null
                    ? unlink(path.join(process.env.STORAGE_PATH, oldTransaction.evidence_image))
                    : undefined)
            })
            .then(_ => {
                oldTransaction.evidence_image = imagePath;
                oldTransaction.status = "diproses";
                return Transactions.updateById(req.params.id, oldTransaction);
            })
            .then(_ => res.status(201).send({
                msg: `Evidence for transaction with id ${req.params.id} successfully updated`,
                data: oldTransaction
            }))
            .catch(err => next(err))
    },
}

function composeTransactionUpdateEmail(destination, transaction) {
    return {
        destination: destination,
        subject: "Status pesananmu diperbarui!", 
        content: (transaction.status == "disetujui"?
            "Transaksimu sudah disetujui, harap segera datang ke alamat kami untuk melakukan pengambilan barang karena durasi peminjaman dihitung sejak pesan ini dikirim. \nTerima kasih sudah memercayakan kebutuhan anda dengan kami!"
            : `Mohon maaf, transaksimu ditolak oleh kami dengan alasan '${transaction.note}'. \nSilakan periksa kembali kelengkapan dan kebenaran data transaksi untuk menyelesaikan transaksi dan memulai peminajaman`
        )
    }
}