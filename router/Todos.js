
const express = require("express")
const { TodosUser,verfiyToken, todoValidation, verfiyTokenCreat } = require("../Models/Todos")
const router = express.Router()
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose');

router.get("/todos/:userId/", asyncHandler(async (req, res) => {
    const userId = req.params.userId
    const user = await TodosUser.findOne({ userId: userId })
    if (!user) {
        return res.status(404).json({ message: "Todos Not Found." })
    }

    res.status(200).json(user)
}))

router.post("/todos/:userId",verfiyToken, asyncHandler(async (req, res) => {
    
    const { error } = todoValidation(req.body)
    if(error){
        return res.status(400).json({message: "There was somethings error."})
    }
    
    const { title, desc } = req.body
    console.log(req.user)
    const user = await TodosUser.findOne({ userId: req.params.userId })
    if (!user) {
        console.log(user)
        const todo = new TodosUser({
            userId: req.user.id,
            username: req.user.username,
            todos: {
                title: title,
                desc: desc
            }
        })
        const result = await todo.save()
        res.status(201).json(result)

    } else {
        const addTodo = await TodosUser.findOneAndUpdate({ userId: req.params.userId }, {
            $push: {
                todos: {
                    title: title,
                    desc: desc
                }
            }
        }, { new: true })
        console.log("is running")
        res.status(200).json(addTodo)
    }

}))

router.put("/todos/:userId/:todoId",verfiyToken, asyncHandler(async (req, res)=>{
    const { title, desc, completed } = req.body
    const {userId, todoId} = req.params
    const todos = await TodosUser.findOne({userId: userId})
    if(!todos){
        res.status(404).json({message: "Not Found"})
    }
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
        return res.status(400).json({ message: "No provided" });
    }
    const todoUpdate = await TodosUser.findOneAndUpdate({"userId": userId, "todos._id": todoId},{
        $set: {
            "todos.$.title": title,
            "todos.$.desc": desc,
            "todos.$.completed": completed,
        }
    },{new: true})

    if(!todoUpdate){
        return res.status(400).json({message: "there was somethings wrong!"})
    }

    res.status(201).json(todoUpdate)
}))

module.exports = router