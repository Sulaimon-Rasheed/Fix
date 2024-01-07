const express = require ("express")
const middleware = require("./middleware.task")
const controller = require("./controller.task")
const auth = require("../authentication/auth")
const cookieParser = require("cookie-parser")
const {DateTime} = require("luxon")

const taskRouter = express.Router()

taskRouter.use(cookieParser())

taskRouter.post("/create", async (req,res)=>{
    const time = DateTime.now().toFormat('LLL d, yyyy, \'at \' HH:mm')
    const response = await controller.createTask(
        {
            task_name:req.body.task_name, 
            state:"pending", 
            user_id:res.locals.user._id,
            createdDate:time,
            dueDate:req.body.dueDate
        })
    if(response.code===200){
        res.redirect("/dashboard")
    }else{
        res.redirect("/invalid_info")
    }
} )

taskRouter.post("/update/:id", controller.updateState)
taskRouter.post("/:id", controller.deleteTask)
taskRouter.get("/filter", controller.filterTask)





module.exports = taskRouter


