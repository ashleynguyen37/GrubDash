const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res) {
    res.json({ data: dishes })
}

// function bodyDataHas(propertyName) {
//     return function (req, res, next) {
//       const { data = {} } = req.body;
//       if (data[propertyName]) {
//         return next();
//       }
//       next({
//           status: 400,
//           message: `Must include a ${propertyName}`
//       });
//     };
//   }

function nameValidation(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name) {
        return next();
    }
    next({
        status: 400,
        message: "A 'name' property is required.",
    })
}

function descriptionValidation(req, res, next) {
    const { data: { description } = {} } = req.body;
    if (description) {
        return next();
    }
    next({
        status: 400,
        message: "A 'description' property is required.",
    })
}

function priceValidation(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (price) {
        return next();
    }
    next({
        status: 400,
        message: "A 'price' property is required.",
    })
}

function imageUrlValidation(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if (image_url) {
        return next();
    }
    next({
        status: 400,
        message: "A 'image_url' property is required.",
    })
}

function priceCheck(req, res, next) {
    const { data: { price } = {} } = req.body;
    if(price > 0 ) {
      return next();
    }
    next({
      status: 400,
      message: "price"
    })
  }

function priceIsANumber(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (typeof(price) !== "number" || price <= 0) {
      next({
        status: 400,
        message: `type of price must be number`,
      });
    }
    return next();
  };

function dishIdMatch(req, res, next) {
    const { data: { id } = {} } = req.body;
    const dishId = req.params.dishId;

    if (id !== undefined && (id !== undefined && id !== null && id !== "" && id !== dishId)) {
        next({
          status: 400,
          message: `id ${id} must match dataId provided in parameters`,
        });
      }
       return next();
 };

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        next();
    } else {
        next ({
            status: 404,
            message: `Dish ${dishId} not found.`
        })
    }
}

function create(req, res) {
    const { data: { name, description, price, image_url }} = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function read(req, res) {
    res.json({ data: res.locals.dish });
}

function update(req, res) {
    const dish = res.locals.dish;
    const {data: { name, description, price, image_url } = {} } = req.body;

    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    
    res.json({ data: dish })
}

module.exports = {
    list,
    create: [
        // bodyDataHas("name"),
        // bodyDataHas("description"),
        // bodyDataHas("price"),
        // bodyDataHas("image_url"),
        nameValidation,
        descriptionValidation,
        priceValidation,
        imageUrlValidation,
        priceCheck,
        create
    ],
    read: [
        dishExists,
        read
    ],
    update: [
        dishExists,
        dishIdMatch,
        nameValidation,
        descriptionValidation,
        priceValidation,
        imageUrlValidation,
        priceIsANumber,
        priceCheck,
        update
    ],
}