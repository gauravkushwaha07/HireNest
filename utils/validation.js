const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    userType: Joi.string().valid('client', 'worker').required()
});

const validateUser = (userData) => {
    return userSchema.validate(userData);
};

module.exports = {
    validateUser
};