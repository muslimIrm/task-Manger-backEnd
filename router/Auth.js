const express = require("express")
const router = express.Router()
const { Users, validationRegister, validationLogin, validationUpdate } = require("../Models/User")
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const { TodosUser } = require("../Models/Todos")
const { TokenExp } = require("../Models/Token")
const { verfiyToken } = require("../Models/Todos")
router.post("/users/register", asyncHandler(async (req, res) => {
    const body = req.body

    const { error } = validationRegister(body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const user = new Users({
        email: body.email,
        username: body.username,
        password: body.password
    })

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.SECRET)
    const result = await user.save();
    const { password, ...others } = result._doc
    res.status(201).json({ ...others, token })
}))

router.post("/users/login", asyncHandler(async (req, res) => {
    const body = req.body
    const { error } = validationLogin(body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const user = await Users.findOne({ email: body.email })
    if (!user) {
        return res.status(404).json({ message: "the email or password is invite" })
    }
    const isPassword = body.password === user.password ? true : false
    if (!isPassword) {
        return res.status(400).json({ message: "the email or password is invite" })

    }

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.SECRET)

    const { password, ...others } = user._doc
    res.status(201).json({ ...others, token })
}))


router.put("/users/update/:id", verfiyToken, asyncHandler(async (req, res) => {
    const body = req.body
    const { error } = validationUpdate(body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const user = await Users.findById(req.params.id)
    if (!user) {
        return res.status(404).json({ message: "404 - Not Found!" })
    }
    const userUpdate = await Users.findByIdAndUpdate(req.params.id,
        {
            $set: {
                username: body.username,
                email: body.email,
                password: body.password
            }
        }, { new: true }
    )

    const { password, ...others } = userUpdate._doc
    res.status(200).json({ success: true, message: "user updated successfully", data: others })
}))




router.delete("/users/delete/:userId/:todosId", verfiyToken, asyncHandler(async (req, res) => {
    const { userId, todosId } = req.params
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await Users.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "404 - Not Found" })
        }
        // Delete The Tasks For User
        await TodosUser.findByIdAndDelete(todosId, { session: session });
        console.log("Successfully deleted tasks for user:", userId)

        // Delete User
        await Users.findByIdAndDelete(userId, { session: session });
        console.log("Successfully Delete User", userId)

        const tokenExp = new TokenExp({
            token: req.headers.token
        })
        await tokenExp.save({ session: session })

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "User and associated data deleted!" })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error during user deletion transaction:", error);
        res.status(500).json({ message: "Failed to delete user and associated data.", error: error.message });

    }
}))

router.post("/users/logout/:userId", verfiyToken, asyncHandler(async (req, res) => {
    const { token } = req.headers
    const tokenExp = new TokenExp({
        token: req.headers.token
    })
    await tokenExp.save()
    res.status(200).json({state: "successfully", message: "You loged out now."})
}))

module.exports = router