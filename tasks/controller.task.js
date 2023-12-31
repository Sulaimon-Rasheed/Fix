const taskModel = require("../models/task");
const {DateTime} = require("luxon")


const createTask = async ({ task_name, state, user_id, createdDate, dueDate}) => {
  const taskInfo = { task_name, state, user_id, createdDate, dueDate };
  if (!taskInfo) {
    return {
      message: "invalid info.",
      code: 422,
    };
  }
  const luxonDueDate = DateTime.fromISO(taskInfo.dueDate).toFormat('LLL d, yyyy \'at\' HH:mm');
  const task = await taskModel.create({
    task_name:taskInfo.task_name,
    state:taskInfo.state,
    created_date:taskInfo.createdDate,
    due_date:luxonDueDate,
    user_id:taskInfo.user_id
  });

  return {
    message: "Task successfully created",
    code: 200,
    task,
  };
};

const filterTask =async (req,res)=>{
try{
  const state = req.query.state
  if(state === "pending"){
  const taskInfos = await taskModel.find({user_id:res.locals.user._id, state:"pending"})
  res.render("pendingTask", {navs:["Create_task","Guide", "Logout"], user:res.locals.user, taskInfos, date:new Date()})
  }else if(state === "completed"){
      const taskInfos = await taskModel.find({user_id:res.locals.user._id, state:"completed"})
      res.render("completedTask", {navs:["Create_task","Guide", "Logout"], user:res.locals.user, taskInfos, date:new Date()})
  }else{
  res.redirect("/dashboard")
  }
}catch(error){
console.log(error.message)
}
}

const updateState = (req, res) => {
  const id = req.params.id
  const update = req.body
  taskModel.findByIdAndUpdate(id, update, { new: true })
      .then(newState => {
        res.redirect("/dashboard")
      }).catch(err => {
          console.log(err)
          res.status(500).send(err)
      })
};

const deleteTask = (req, res) => {
  const id = req.params.id
  taskModel.findByIdAndRemove(id)
      .then(book => {
          res.redirect("/dashboard")
      }).catch(err => {
          console.log(err)
          res.status(500).send(err)
      })
}

module.exports = { createTask, updateState, deleteTask, filterTask};
