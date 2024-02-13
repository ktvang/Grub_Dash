const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

function bodyHasProperty(req, res, next, property, errorMessage) {
  const { data = {} } = req.body;
  if (!data[property]) {
    next({
      status: 400,
      message: errorMessage,
    });
  }
  res.locals.reqBody = data;
  return next();
}

function bodyHasNameProperty(req, res, next) {
  bodyHasProperty(
    req,
    res,
    next,
    "name",
    "Dish must include a name."
  );
}

function bodyHasDescriptionProperty(req, res, next) {
  bodyHasProperty(
    req,
    res,
    next,
    "description",
    "Dish must include a description."
  );
}

function bodyHasPriceProperty(req, res, next) {
  const { price } = res.locals.reqBody;
  if (!price || price < 0 || typeof price !== "number") {
    next({
      status: 400,
      message: "Dish must include a price and it must be an integer greater than 0.",
    });
  }
  return next();
}

function bodyHasImageUrlProperty(req, res, next) {
  bodyHasProperty(
    req,
    res,
    next,
    "image_url",
    "Dish must include an image_url."
  );
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    res.locals.dishId = dishId;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
}

function bodyIdMatchesRouteId(req, res, next) {
  const dishId = res.locals.dishId;
  const { id } = res.locals.reqBody;
  if (id && id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  return next();
}

function update(req, res) {
  const { dish, reqBody } = res.locals;
  for (const propName in dish) {
    if (reqBody.hasOwnProperty(propName) && dish[propName] !== reqBody[propName]) {
      dish[propName] = reqBody[propName];
    }
  }
  res.json({ data: dish });
}

function create(req, res) {
  const { reqBody } = res.locals;
  const newDish = {
    ...reqBody,
    id: nextId(),
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  create: [
    bodyHasNameProperty,
    bodyHasDescriptionProperty,
    bodyHasPriceProperty,
    bodyHasImageUrlProperty,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    bodyHasNameProperty,
    bodyHasDescriptionProperty,
    bodyHasPriceProperty,
    bodyHasImageUrlProperty,
    bodyIdMatchesRouteId,
    update,
  ],
  list,
};