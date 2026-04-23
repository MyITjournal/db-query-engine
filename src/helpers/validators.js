import { query, body, param, validationResult } from "express-validator";

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const error = errors.array()[0];
  const statusCode = error.value !== undefined && error.value !== "" ? 422 : 400;
  const message = statusCode === 422 ? "Invalid parameter type" : "Missing or empty parameter";

  return res
    .status(statusCode)
    .json({ status: "error", message });
}

export const classifyQueryRules = [
  query("name")
    .notEmpty()
    .withMessage("A valid name is required")
    .bail()
    .isString()
    .withMessage("A valid name is required")
    .trim(),
];

const SORT_FIELDS = ["age", "created_at", "gender_probability"];

export const profilesListRules = [
  query("gender")
    .optional()
    .isString()
    .withMessage("Invalid gender filter")
    .trim()
    .notEmpty()
    .withMessage("Invalid gender filter")
    .toLowerCase(),
  query("age_group")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["child", "teenager", "adult", "senior"])
    .withMessage("age_group must be one of: child, teenager, adult, senior"),
  query("country_id")
    .optional()
    .isString()
    .withMessage("Invalid country_id filter")
    .trim()
    .notEmpty()
    .withMessage("Invalid country_id filter")
    .toUpperCase(),
  query("min_age")
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage("min_age must be an integer between 0 and 150")
    .toInt(),
  query("max_age")
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage("max_age must be an integer between 0 and 150")
    .toInt(),
  query("sort_by")
    .optional()
    .isIn(SORT_FIELDS)
    .withMessage(`sort_by must be one of: ${SORT_FIELDS.join(", ")}`),
  query("order")
    .optional()
    .toLowerCase()
    .isIn(["asc", "desc"])
    .withMessage("order must be asc or desc"),
  query("min_gender_probability")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("min_gender_probability must be a number between 0 and 1")
    .toFloat(),
  query("min_country_probability")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("min_country_probability must be a number between 0 and 1")
    .toFloat(),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be between 1 and 50")
    .toInt(),
];

export const searchRules = [
  query("q")
    .exists({ values: "null" })
    .withMessage("Search query q is required")
    .bail()
    .isString()
    .withMessage("Search query must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Search query cannot be empty")
    .isLength({ max: 500 })
    .withMessage("Search query must not exceed 500 characters"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100")
    .toInt(),
];

export const profileIdRules = [
  param("id").isUUID().withMessage("Invalid profile id"),
];

export const createProfileRules = [
  body("name")
    .exists({ values: "null" })
    .withMessage("A valid name is required")
    .bail()
    .isString()
    .withMessage("A valid name is required")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("A valid name is required"),
];
