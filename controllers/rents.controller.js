import Rents from "../models/Rents.js";
import OrderItems from "../models/OrderItems.js";

export default {
  index: function(req, res, next) {
    Rents.getAll()
      .then(result => res.send({ data: result }))
      .catch(err => next({
        message: "An error occurred during database operation",
        log: err
      }));
  },

  findOne: function(req, res, next) {
    Rents.getById(req.params.id)
      .then(result => {
        if (result.length == 0) throw {
          code: "not_found",
          msg: "No Rent with specified id has found"
        };
        res.send({ data: result[0] });
      })
      .catch(err => next({
        message: "An error occurred during database operation",
        log: err
      }));
  },

  findByOrderItemId: function(req, res, next) {
    Rents.getByOrderItemId(req.params.orderItemId)
      .then(result => {
        if (result.length == 0) throw {
          code: "not_found",
          msg: "No Rent with specified orderItemId has found"
        };
        res.send({ data: result[0] });
      })
      .catch(err => next({
        message: "An error occurred during database operation",
        log: err
      }));
  },

  store: async function(req, res, next) {
    const ACCEPTED = ["orderItem_id", "rent_start", "rent_due", "return_date"];
    Object.keys(req.body).forEach(key => {
      if (!ACCEPTED.includes(key)) delete req.body[key];
    });

    if (Object.keys(req.body).length < ACCEPTED.length - 1) {  // return_date is optional
      return next({ code: "incomplete_request", msg: "Not enough data to process" });
    }

    try {
      const orderItem = await OrderItems.getById(req.body.orderItem_id);
      if (orderItem.length == 0) {
        throw { code: "not_found", msg: "No OrderItem with specified id has found" };
      }

      const availability = await Rents.checkAvailability(req.body.orderItem_id, req.body.rent_start, req.body.rent_due);
      if (availability.length > 0) {
        throw { code: "unavailable", msg: "The item is not available for the selected dates" };
      }

      await Rents.reduceStock(orderItem[0].variant_id, orderItem[0].count);

      const result = await Rents.store(req.body);
      res.status(201).send({
        msg: `Rent created with id:${result.insertId}`,
        data: {
          id: result.insertId,
          ...req.body,
        }
      });
    } catch (err) {
      next({
        message: "An error occurred during database operation",
        log: err
      });
    }
  },

  edit: function(req, res, next) {
    const ACCEPTED = ["rent_start", "rent_due", "return_date"];
    Object.keys(req.body).forEach(key => {
      if (!ACCEPTED.includes(key)) delete req.body[key];
    });

    if (Object.keys(req.body).length == 0) {
      return next({ code: "incomplete_request", msg: "No data to process" });
    }

    Rents.updateById(req.params.id, req.body)
      .then(result => {
        if (result.affectedRows == 0) throw {
          code: "not_found",
          msg: `No Rent with id ${req.params.id} found`
        };
        return res.status(201).send({
          msg: `Rent edited with id:${req.params.id}`,
          data: {
            id: Number(req.params.id),
            ...req.body,
          }
        });
      })
      .catch(err => next({
        message: "An error occurred during database operation",
        log: err
      }));
  },

  destroy: async function(req, res, next) {
    try {
      const rent = await Rents.getById(req.params.id);
      if (rent.length == 0) {
        throw { code: "not_found", msg: `No Rent with id ${req.params.id} found` };
      }

      const orderItem = await OrderItems.getById(rent[0].orderItem_id);
      await Rents.restoreStock(orderItem[0].variant_id, orderItem[0].count);

      await Rents.deleteById(req.params.id);
      res.send({ msg: `Deleted Rent with id: ${req.params.id}` });
    } catch (err) {
      next({
        message: "An error occurred during database operation",
        log: err
      });
    }
  }
}
