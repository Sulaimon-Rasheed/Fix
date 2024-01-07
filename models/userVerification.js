const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const UserVerificationSchema = new Schema({
  uniqueString: { type:String, unique:true},
  uniqueStringExpireDate: { type: String},
  userId: { type: String, unique: true }
});

module.exports = mongoose.model("userVerifications", UserVerificationSchema)