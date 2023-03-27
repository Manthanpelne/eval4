const express = require("express")
const userRouter = express.Router()
require("dotenv").config()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const {userModel} = require("../models/usermodel")
const redis = require("redis")
const {authenticate} = require("../middlewares/authenticate")
const { json } = require("body-parser")

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const client = redis.createClient()

client.on("error",(err)=>console.log("Redis client error",err))
client.connect()


userRouter.post("/signup",(req,res)=>{
    try {
        const {name,email,pass} = req.body
        bcrypt.hash(pass,5,async(err,hash)=>{
            const user = new userModel({
                name:name,
                email:email,
                pass:hash
            })
            await user.save()
            res.send({"msg":"signup successfull",user})
        })
    } catch (error) {
        console.log(error.message)
    }
})

userRouter.post("/login",async(req,res)=>{
    const {email,pass}  = req.body
    const user = await userModel.findOne({email})
    if(!user){
        return res.send("signup first")
    }
    const hashpass = user?.pass
    bcrypt.compare(pass,hashpass,(err,result)=>{
        if(result){
            const token = jwt.sign({userID:user._id},process.env.secretkey,{expiresIn:"1d"})
        res.send({"msg":"login successfull",token})
        }else{
            res.send("login failed")
        }
    })
})


userRouter.post("/logout",(req,res)=>{
    const token = req.headers.authorization
    try {
        client.LPUSH("black",token)
        res.send("logged out successfully")
    } catch (error) {
        console.log(error.message)
    }
})


userRouter.get("/weatherData/:query",authenticate,async(req,res)=>{
   const query= req.params.query
    try {
    const response = await fetch(`http://api.weatherstack.com/current?access_key=041a6aa07bec62e24b448b336f391566&query=${query}`)
    const body = await response.json()
    res.send(body)
    
    client.SET("weatherkey",JSON.stringify({body}),1800)

    } catch (error) {
        console.log(error.message)
    }

})



userRouter.get("/",authenticate,(req,res)=>{
    res.send("data")
})

module.exports = {userRouter}