const mongoose = require("mongoose")
const Joi = require('joi');
const jwt = require("jsonwebtoken")
const { Users } = require("../Models/User")
const { TokenExp } = require("../Models/Token")
const TodosSchema = mongoose.Schema({
    title: {
        type: String,
        maxlength: 40,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        maxlength: 200,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    
},{
    timestamps: true
})

const UserWithTodos = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    todos: [TodosSchema],
    
},{
    timestamps: true
})

const TodosUser = mongoose.model("Todos", UserWithTodos)

const todoValidation = (obj) => {
    const schema = Joi.object({
        title: Joi.string().max(40).required().trim(),
        desc: Joi.string().max(200).required().trim(),
        completed: Joi.boolean().optional(),
    })
    return schema.validate(obj)
}

const verfiyToken = async (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(400).json({ message: "No token provided." })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded
        console.log(req.user.id, req.params.userId)
        if (req.user.id === req.params.userId) {
            const isInvalidToken = await TokenExp.findOne({ token: token })
            if (!isInvalidToken) {
                next();
            } else {
                console.log(isInvalidToken, !isInvalidToken)

                return res.status(404).json({ message: "Invalid token. User no longer exists" })
            }
        } else {
            return res.status(400).json({ message: "this is not your acount!" })
        }
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" })
    }

}
const verfiyTokenCreat = async (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(400).json({ message: "No token provided." })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded
        const isInvalidToken = TokenExp.findOne({ token: token })
        if (!isInvalidToken) {
            next();
        } else {
            console.log(isInvalidToken, !isInvalidToken)
            return res.status(404).json({ message: "Invalid token. User no longer exists" })
        }

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" })
    }

}


module.exports = {
    TodosUser,
    todoValidation,
    verfiyToken,
    verfiyTokenCreat
};