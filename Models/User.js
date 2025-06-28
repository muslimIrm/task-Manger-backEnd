const mongoose = require("mongoose")
const Joi = require('joi');
const jwt = require("jsonwebtoken")
const userSchema = mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true,
        maxlength: 10,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    }
},{
    timestamps: true
})

const Users = mongoose.model("Users", userSchema)





const validationRegister = (obj) => {
    const schema = Joi.object({
        username: Joi.string().max(10).min(3).trim().required(),
        email: Joi.string().email().max(100).min(5).trim().required(),
        password: Joi.string().min(8).trim().required()
    })
    return schema.validate(obj)
}

const validationLogin = (obj) => {
    const schema = Joi.object({
        email: Joi.string().email().max(100).min(5).trim().required(),
        password: Joi.string().min(8).trim().required()
    })
    return schema.validate(obj)
}

const validationUpdate = (obj) => {
    const schema = Joi.object({
        username: Joi.string().max(10).min(3).trim(),
        email: Joi.string().email().max(100).min(5).trim(),
    })
    return schema.validate(obj)
}


module.exports = {Users, validationRegister, validationLogin, validationUpdate};