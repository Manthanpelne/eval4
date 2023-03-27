const express = require("express")
const app = express()
require("dotenv").config()
const {connection} = require("./db")
const {userRouter} = require("./routes/userroute")
const winston = require("winston")
const expressWinston = require("express-winston")


app.use(expressWinston.logger({
    statusLevels:true,
    transports: [
      new winston.transports.Console({
        level:"info",
        json:true
      }),
      new winston.transports.File({
        level:"info",
        json:true,
        filename:"data.log"
      })
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    )
  }));



app.use(express.json())

app.use("/user",userRouter)

app.listen(process.env.port,async()=>{
    await connection
    console.log(`running at server ${process.env.port}`)
})