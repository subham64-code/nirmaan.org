const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

const validateName = body('name')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Name must be between 2 and 100 characters')
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name can only contain letters and spaces');

const validatePhone = body('phone')
  .optional()
  .isMobilePhone('any')
  .withMessage('Please provide a valid phone number');

const validateDeliveryMethod = body('deliveryMethod')
  .optional()
  .isIn(['email', 'sms', 'both'])
  .withMessage('Delivery method must be email, sms, or both');

const validateRole = body('role')
  .isIn(['admin', 'teacher', 'student'])
  .withMessage('Role must be admin, teacher, or student');

// Specific validation chains
const validateUserRegistration = [
  validateName,
  validateEmail,
  validatePassword,
  validatePhone,
  body('qualification')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Qualification cannot exceed 200 characters'),
  body('course')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Course cannot exceed 100 characters'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateOtpRequest = [
  validateEmail,
  validatePhone,
  validateDeliveryMethod,
  validateRole,
  handleValidationErrors
];

const validateOtpVerification = [
  validateEmail,
  validateRole,
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  handleValidationErrors
];

const validateApplication = [
  validateName,
  validateEmail,
  validatePhone,
  body('qualification')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Qualification must be between 2 and 200 characters'),
  body('course')
    .isIn(['AI/ML', 'Deep Learning', 'NLP', 'Generative AI', 'Soft Skills'])
    .withMessage('Please select a valid course'),
  body('tenthMarks')
    .isInt({ min: 0, max: 100 })
    .withMessage('10th marks must be between 0 and 100'),
  body('twelfthMarks')
    .isInt({ min: 0, max: 100 })
    .withMessage('12th marks must be between 0 and 100'),
  body('degreeMarks')
    .isInt({ min: 0, max: 100 })
    .withMessage('Degree marks must be between 0 and 100'),
  body('agreedToTerms')
    .isBoolean()
    .custom(value => value === true)
    .withMessage('You must agree to the terms and conditions'),
  handleValidationErrors
];

const validateAttendance = [
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('status')
    .isIn(['Present', 'Absent', 'Late', 'Excused'])
    .withMessage('Status must be Present, Absent, Late, or Excused'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('course')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Course cannot exceed 100 characters'),
  handleValidationErrors
];

const validateTestCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('course')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Course must be between 2 and 100 characters'),
  body('durationMinutes')
    .isInt({ min: 1, max: 600 })
    .withMessage('Duration must be between 1 and 600 minutes'),
  body('totalMarks')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total marks must be between 1 and 1000'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.prompt')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Question prompt must be between 5 and 1000 characters'),
  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Each question must have between 2 and 6 options'),
  body('questions.*.answer')
    .isInt({ min: 0 })
    .withMessage('Answer must be a valid option index'),
  handleValidationErrors
];

const validateSms = [
  body('to')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 160 })
    .withMessage('Message must be between 1 and 160 characters'),
  handleValidationErrors
];

const validateEmailSend = [
  body('to')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message must be between 1 and 10000 characters'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateOtpRequest,
  validateOtpVerification,
  validateApplication,
  validateAttendance,
  validateTestCreation,
  validateSms,
  validateEmailSend,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateRole
};
