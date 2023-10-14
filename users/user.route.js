const express = require ("express")
const middleware = require("./middleware.user")
const controller = require("./controller.user")
const cookieParser = require("cookie-parser")

const userRouter = express.Router()

userRouter.use(cookieParser())

userRouter.post("/signup", middleware.validateUser, async (req,res)=>{
    const response = await controller.createUser({username:req.body.username, password:req.body.password})
    if(response.code === 200){
        res.redirect("/login")
    }else{
        res.redirect("/existingUser")
    }
})

userRouter.post("/login", middleware.validateUser, async(req,res)=>{
    const response = await controller.login({username:req.body.username, password:req.body.password})
    if(response.code === 200){
        res.cookie("jwt", response.token, {maxAge:60 * 60 * 1000})
        res.redirect("/dashboard")
    }else if(response.code === 404){      //user does not exist
        res.redirect("/userNotFound")
    }else{
        res.redirect("/invalidInfo")     // username or password is incorrect
    }
})

module.exports = userRouter