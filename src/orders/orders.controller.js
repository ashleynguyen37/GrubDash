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

module.exports = {
    list,
    create: [
        deliverToValidation,
        mobileNumberValidation,
        statusValidation,
        dishesValidation,
        create
    ]
}