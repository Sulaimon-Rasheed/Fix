const express = require("express")
const bodyParser = require('body-parser')
const userRoute = require("./users/user.route")
const taskRoute = require("./tasks/task.route")
const cookieParser = require("cookie-parser")
const auth = require("./authentication/auth")
const taskModel = require("./models/task")
const session = require("express-session")

const app = express()

require("./util/scheduler")

app.set("view engine", "ejs")
app.set("views", "views")

app.locals.siteName = "Fix"
app.use(bodyParser.urlencoded({extended:false}))

app.use(cookieParser())
app.use(session({
    secret:"rasmon12",
    cookie:{maxAge:60000},
    resave:true,
    saveUninitialized:true
  }))
app.use("/users", userRoute)
app.use("/tasks", auth.ensureLogin, taskRoute)
app.use("/public", express.static("public"))

app.get("/", (req,res)=>{
    const tasks = taskModel.find().populate("user_id", "username email")
    console.log(tasks)
    res.status(200).render("index",{navs:["Guide", "Signup", "Dashboard"]})
})
app.get("/signup", (req,res)=>{
    res.status(200).render("signup",{navs:["Guide", "Login"]})
})

app.get("/login", (req,res)=>{
    res.status(200).render("login",{navs:["Guide", "Signup"]})
})

app.get("/dashboard", auth.ensureLogin, async (req,res)=>{
    const taskInfos = await taskModel.find({user_id:res.locals.user._id})
    res.status(200).render("dashboard", {
        navs:["Create_task","Guide", "Logout"], user:res.locals.user, taskInfos, date:new Date()
    })
})

app.get("/existingUser",(req,res)=>{
    res.status(409).render("existingUser", {
        navs:["Signup", "Login"]
    })
})

app.get("/userNotFound",(req,res)=>{
    res.status(404).render("userNotFound", {
        navs:["Signup"]
    })
})

app.get("/invalidInfo",(req,res)=>{
    res.status(422).render("invalidInfo", {
        navs:["Login", "Signup"]
    })
})

app.get("/create_task", auth.ensureLogin, (req,res)=>{
    res.status(200).render("create_task", {
        navs:["Dashboard", "Logout"], date:new Date()
    })
})

app.get("/guide", (req,res)=>{
    res.status(200).render("guide", {
        navs:["Signup","Login", "Dashboard"]
    })
})

app.get("/serverError/:message", (req,res)=>{
    const message = req.params.message
    return res.render("serverError", {navs:["signup"], message})
})

app.get("/errorHandler/:message", (req,res)=>{
    const message = req.params.message
    return res.render("errorHandler", {navs:["signup"], message},)
})

app.get("/successfulVerification/:message", (req,res)=>{
    const message = req.params.message
    res.status(200).render("successfulVerification", {
        navs:["Signup","Login", "Dashboard"], message
    })
})

app.get("/successfulSignup/:message", (req,res)=>{
    const message = req.params.message
    res.status(200).render("successfulSignup", {
        navs:["Guide"], message
    })
})

app.get("/logout", (req,res)=>{
    res.clearCookie("jwt")
    res.redirect("/")
} )

app.get("*", (req,res)=>{
    res.status(404).render("pageNotFound", {navs:["Guide"]})
})

app.use((err, req, res, next) => {
    res.redirect(`/serverError/${err.message}`)
    next()
});

module.exports = app
