const exporess = require("express")
const mongodb = require("mongoose")
const authRouter = require("./router/Auth")
const Todos = require("./router/Todos")
const app = exporess()
require('dotenv').config();
app.use(exporess.json());

mongodb.connect(process.env.DB_URL)
.then(()=>{
    console.log("connected to Mongodb")
    const PORT = process.env.PORT || 3000
    app.listen(PORT, ()=>{console.log(`Server is running on port ${PORT}`)})
})
.catch((err) => {
    console.log("failed. somethings error", err)
    process.exit(1)
})

app.use("/api", authRouter)
app.use("/api", Todos)


