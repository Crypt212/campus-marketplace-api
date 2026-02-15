import { validationResult } from "express-validator";
import { BadRequestError } from "../errors/errors.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((err) => `${err.path}: ${err.msg}`)
      .join(", ");

    return next(new BadRequestError(message));
  }

  next();
};

export default validate;
