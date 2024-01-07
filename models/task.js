const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const TaskSchema = new Schema({
  task_name: { type: String },
  state: { type: String, value: ["pending", "completed", "deleted"], default:"pending" },
  created_date:{type:String},
  due_date:{type:String},
  user_id:[{type:Schema.Types.ObjectId, ref:"users"}]
});

module.exports = mongoose.model("tasks", TaskSchema);