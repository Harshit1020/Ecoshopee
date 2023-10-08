const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
mongoose.set("strictQuery", true);
var productSchema = mongoose.Schema({
name : String,
price:Number,    
sellerid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
},    
pic :{
    type:Array,
    default :[]
},
discount:{
    type:Number,
    default:0
},
desc:String
})
module.exports = mongoose.model("product",productSchema);
