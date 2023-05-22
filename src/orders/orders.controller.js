const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
    res.json({ data: orders })
}

function deliverToValidation(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if (deliverTo) {
        next();
    }
    next({
        status: 400,
        message: "A 'deliverTo' propety is required." 
    })
}

function mobileNumberValidation(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber) {
        next();
    }
    next({
        status: 400,
        message: "A 'mobileNumber' propety is required." 
    })
}

function statusValidation(req, res, next) {
    const { data: { status } = {} } = req.body;
    if (status) {
        next();
    }
    next({
        status: 400,
        message: "A 'status' propety is required." 
    })
}

function dishesValidation(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (dishes) {
        next();
    }
    next({
        status: 400,
        message: "A 'dishes' propety is required." 
    })
}

function statusCheck(req, res, next) {
    const { data: { status } = {} } = req.body;
    if(status.includes("pending") || status.includes("preparing") || status.includes("out-for-delivery") || status.includes("delivered")) {
        next();
    }
    next({
        status: 400,
    message: "status property must be valid string: 'pending', 'preparing', 'out-for-delivery', or 'delivered'",
    })
}

function dishesCheck(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (!Array.isArray(dishes) || dishes.length == 0) {
      next({
        status: 400,
        message: "invalid dishes property: dishes property must be non-empty array",
    });
    }
    next();
  };

function dishArrayValidation(req, res, next) {
    const { data: { dishes } = {} } = req.body;
  if (!Array.isArray(dishes) || dishes.length == 0) {
    next({
      status: 400,
      message: "invalid dishes property: dishes property must be non-empty array",
  });
  }
  next();
  };

function correctDishQuantity(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    dishes.forEach((dish) => {
      const quantity = dish.quantity;
      if (!quantity || quantity <= 0 || typeof quantity !== "number") {
        return next ({
          status: 400,
          message: `dish ${dish.id} must have quantity property, quantity must be an integer, and it must not be equal to or less than 0`
        });
      }
    }); 
    next();
  };

function orderIdMatch(req, res, next) {
    const { data: { id } = {} } = req.body;
    const orderId = req.params.orderId;
    if (id !== undefined && id !== null && id !== "" && id !== orderId) {
      next({
        status: 400,
        message: `id ${id} must match orderId provided in parameters`,
      });
    }
     return next();
  };

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    if(foundOrder) {
        res.locals.order = foundOrder;
        next();
    } else {
        next({
            status: 404,
            message: `Order id ${orderId} not found.`,
        })
    }
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder })
}

function read(req, res) {
    res.json({ data: res.locals.order });
}

function update(req, res) {
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({ data: order });
}

function destroy(req, res, next) {
    const { orderId } = req.params;
    const order = res.locals.order;

    if(order.status === "pending") {
        const index = orders.findIndex((order) => order.id === orderId);
        orders.splice(index, 1);
        res.sendStatus(204);
    }
    return next({
        status: 400,
        message: "order cannot be deleted unless the order status is 'pending'",
    })
}

module.exports = {
    list,
    create: [
        deliverToValidation,
        mobileNumberValidation,
        dishesValidation,
        dishArrayValidation,
        correctDishQuantity,
        create
    ],
    read: [
        orderExists,
        read
    ],
    update: [
        orderExists,
        orderIdMatch,
        deliverToValidation,
        mobileNumberValidation,
        dishesValidation,
        dishArrayValidation,
        correctDishQuantity,
        statusValidation,
        statusCheck,
        update
    ],
    delete: [
        orderExists,
        destroy
    ],
}