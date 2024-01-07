const cron = require("node-cron")
const util = require("./nodemailer")
const {DateTime} = require("luxon")
const taskModel = require("../models/task")

cron.schedule("0 0 * * *", async ()=>{
    const tasks = await taskModel.find({state:"pending"}).populate("user_id", "username email")
    const current_time = DateTime.now()
   

    tasks.forEach(task=>{
        const option = {
            email:task.user_id[0].email,
            subject:"Reminder from Fix",
            html:`<p>Hi, ${task.user_id[0].username}</P>
            <p>Don't forget your task, <b> ${task.task_name}</b> will be due in about 1hr.</p>
            <p>At fix, we care that you don't mis your task or appointment.</p>`
         }
       const due_time = DateTime.fromFormat( task.due_date, 'LLL d, yyyy \'at\' HH:mm');
        const time_diff =Math.round(due_time.diff(current_time, "hours").hours)
        console.log(time_diff)
        if(time_diff === 1){
           util.sendEmail(option)
        }
    })

})