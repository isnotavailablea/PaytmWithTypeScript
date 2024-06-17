import express from "express"
import cors from "cors"
import {router} from "./routes/index"
const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/v1" , router)
app.get("/hello" , (req , res) => {
    res.json({
        data : "Hello"
    })
})
app.listen(8000 , ()=>{
    console.log("Server Active On Port 8000")
})