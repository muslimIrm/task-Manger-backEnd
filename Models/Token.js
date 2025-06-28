const mongoose = require("mongoose")

const toeknSchema = mongoose.Schema({
    token: {
        type: String,
        trim: true,
        required: true,
        unique: true
    }
},{
    timestamps: true
})

const TokenExp= mongoose.model("TokenExp", toeknSchema)

module.exports = {TokenExp}