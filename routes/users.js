const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
mongoose.set("strictQuery", true);
const plm = require('passport-local-mongoose')
mongoose.connect("mongodb://localhost/amazon")
.then(function(){

  console.log("connected to db")
})
var userSchema = mongoose.Schema({
username : String,
name : String,
gstin : {
  type:String,
  default:""
},
pic : String,
password: String,
isSeller: {
  type:Boolean,
  default:false
},
address : {
  type:String,
  default:""
},
contactnumber : String,
email : String,
products:[{
  type: mongoose.Schema.Types.ObjectId,
  ref:"product"
}],
whislist:[{

  type: mongoose.Schema.Types.ObjectId,
  ref:"product"

}]
})

userSchema.plugin(plm);
module.exports = mongoose.model("user",userSchema);
