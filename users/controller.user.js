const userModel = require("../models/user")
const taskModel = require("../models/task")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcrypt")

const createUser = async ({username,email, password, verified})=>{
    const userInfo = {username,email, password, verified}
    const existingUser = await userModel.findOne({username:userInfo.username})
    if(existingUser){
      return{
        message:"user already exist",
        code:409
      }
    }

    const hashedPassword = await bcrypt.hash(userInfo.password, 10)
    
    const newUser = await userModel.create({
        username:userInfo.username,
        password:hashedPassword,
        email:userInfo.email,
        verified:userInfo.verified
    })
    return{
        message:"successful signup",
        code:200,
        newUser
    }
}

const login = async ({email, password})=>{
  const logInfo = {email, password}
  const user = await userModel.findOne({email:logInfo.email})
  if(!user){
    return{
      code:404,
      message:"User not found"
    }
  }

  if(!user.verified){
    return{
      code:403,
      message:"You are not authorized to login.We have sent you an email to verify yourself"
    }
  }

  // const validPassword = await user.isValidPassword(logInfo.password)
  const validPassword = await bcrypt.compare(logInfo.password, user.password)
   
    if(!validPassword){
      return{
        code:422,
        message:"username or password is incorrect",
      }  
    }
  const token = await jwt.sign({_id:user._id, username:user.username}, process.env.JWT_SECRET, {expiresIn:"1h"})
  return{
    message:"successful login",
    code:200,
    user,
    token
  
  }

}

module.exports = {createUser,login}