const userModel = require("../models/user")
const taskModel = require("../models/task")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const createUser = async ({username, password})=>{
    const userInfo = {username, password}
    const existingUser = await userModel.findOne({username:userInfo.username})
    if(existingUser){
      return{
        message:"user already exist",
        code:409
      }
    }
    const newUser = await userModel.create({
        username:userInfo.username,
        password:userInfo.password
    })
    return{
        message:"successful signup",
        code:200,
        newUser
    }
}

const login = async ({username, password})=>{
  const logInfo = {username, password}
  const user = await userModel.findOne({username:logInfo.username})
  if(!user){
    return{
      code:404,
      message:"User not found"
    }
  }
  const validPassword = await user.isValidPassword(logInfo.password)
    if(!validPassword){
      return{
        code:422,
        message:"email or password is incorrect",
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