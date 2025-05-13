// middlewares/validation.js - Input validation middleware
const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Event creation validation
const validateEventCreation = [
  body('name')
    .notEmpty().withMessage('Event name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Event name must be between 3 and 100 characters'),
  body('description')
    .notEmpty().withMessage('Description is required'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('location')
    .notEmpty().withMessage('Location is required'),
  body('volunteersRequired')
    .isInt({ min: 1 }).withMessage('Number of volunteers required must be at least 1'),
  handleValidationErrors
];

// Event update validation
const validateEventUpdate = [
  param('id')
    .notEmpty().withMessage('Event ID is required'),
  handleValidationErrors
];

// Query creation validation
const validateQueryCreation = [
  body('eventId')
    .notEmpty().withMessage('Event ID is required'),
  body('message')
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 5 }).withMessage('Message must be at least 5 characters long'),
  handleValidationErrors
];

// Query response validation
const validateQueryResponse = [
  param('id')
    .notEmpty().withMessage('Query ID is required'),
  body('response')
    .notEmpty().withMessage('Response is required')
    .isLength({ min: 5 }).withMessage('Response must be at least 5 characters long'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateEventCreation,
  validateEventUpdate,
  validateQueryCreation,
  validateQueryResponse
};