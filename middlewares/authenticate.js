require("dotenv").config()
const jwt = require("jsonwebtoken")
const redis = require("redis")

const client = redis.createClient()

client.on("error",(err)=>console.log("Redis client error",err))
client.connect()


const authenticate = async(req,res,next)=>{
    const token = req.headers.authorization

    if(!token){
        return res.send("login again")
    }
    
    const result = await client.lRange("black",0,99999999)
    if(result.indexOf(token)>-1){
        return res.json({
            status:400,
            error:"please login again"
        })
    }
  next()
}

module.exports = {authenticate}