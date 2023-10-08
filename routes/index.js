const express = require('express');
const router = express.Router();
const userModel = require('./users')
const passport = require('passport')
const multer = require("multer")
const path = require('path');
const config = require('../config/config')
const crypto = require('crypto')
const productModel = require("./products")
// const expressSession = require(expressSession)

const userImageupload = multer({ storage: config.userImageStorage })
const prductImageupload = multer({storage : config.productImagesStorage})

const localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))


/* GET home page. */
// Main Page
router.get('/',redirecttoprofile,function(req, res) {
  res.render('index');
});

// router.get('/success', function(req, res) {
//   res.send("loggedin !")
// });

// router.get('/logout', function(req, res) {
//   res.send("hnn ja rha hu  !")
// });
// router.get('/failed', function(req, res) {
//   res.send("failed!")
// });

// For profile page route 
router.get('/profile',isLoggedIn,async function(req, res) {
let user = await userModel.findOne({username:req.session.passport.user}).populate("products")

let verified = true;
let ans = user.toJSON();
var ignore = ["products","whislist"];
for(let val in ans){
  if(ignore.indexOf(val) === -1 && ans[val].length === 0) verified =  false;
}

res.render("profile",{user,verified});


});

// mart rout

router.get('/mart',isLoggedIn,async function(req, res) {
  let allproducts  = await productModel.find().limit(8).populate("sellerid")
  res.render("mart",{allproducts});

  });

// For product details verification ......

router.get('/verify',isLoggedIn,async function(req, res) {
  let user = await userModel.findOne({username:req.session.passport.user})
  res.render("verify", {user})
  });

  router.post('/verify',isLoggedIn,async function(req, res) {

    let data = {
        username : req.body.username,
        name : req.body.name,
        gstin : req.body.gstin,
        address : req.body.address,
        contactnumber : req.body.contactnumber,
        email : req.body.email,
        isSeller : req.body.isSeller
      
    }
  let updateduser = await userModel.findOneAndUpdate({username:req.session.passport.user},data)
    res.redirect("/profile")
    });

// for product image upload ..

router.post('/upload',isLoggedIn,userImageupload.single("image"),async function(req, res,next){
  
  let user = await userModel.findOne({username:req.session.passport.user})
  user.pic = req.file.filename;
  await user.save();
  res.redirect('/profile')
});

// for show all products 
router.get('/product', isLoggedIn, async function(req,res){
 let loggedinuser  = await userModel.findOne({username:req.session.passport.user})
 let allproducts  =  await productModel.find()
  res.render("products",{allproducts, loggedinuser});
})


// For creating the product 

router.post('/create/product', isLoggedIn, prductImageupload.array("image", 3), async function(req,res){

    var userData = await userModel.findOne({username:req.session.passport.user})
    if(userData.isSeller){
      let data = {
          sellerid : userData._id,
          name :req.body.name,
          pic : req.files.map(elm => elm.filename),
          desc: req.body.desc,
          price:req.body.price,
          discount:req.body.discount
      }
     
     let productdata =await productModel.create(data);
     userData.products.push(productdata._id)
     await userData.save();
    }  
    else{
      res.send("you are not vendor to sell products at mamazon.");
    }
    
    res.redirect("back")
 })
 // Edit product 
 router.get('/edit/product/:id', isLoggedIn, async function(req,res){
 let product= await productModel.findOne({_id:req.params.id})
 res.send("this page will show a form with product data filled")

 })
// For edit the product details ..
 router.post('/edit/product/:id', isLoggedIn, async function(req,res){

  let product = await productModel.findOne({_id:req.params.id}).populate("sellerid");
  let userData = await userModel.findOne({username:req.session.passport.user});

  if(product.sellerid.username === userData.username){
   await productModel.findOneAndUpdate({_id:req.params.id},{data})
  }

  //................
 })

// For deleting the created by loggedin user .....
 router.get('/delete/product/:id',isLoggedIn, async function(req,res){
     let product =  await productModel.findOne({_id:req.params.id}).populate("sellerid");
     let user = await userModel.findOne({username:req.session.passport.user});
     if(product.sellerid.username === user.username){
      let productDelete =  await productModel.findOneAndDelete({_id:req.params.id});
     }
     user.products.splice(user.products.indexOf(user._id),1);
     await user.save();
     res.redirect("back");
 })

 // whishlist 
 router.get('/whislist/product/:id', isLoggedIn,async function(req,res){

  let user = await userModel.findOne({username:req.session.passport.user}).populate("products");
 let product = await productModel.findOne({_id:req.params.id}).populate("sellerid");

 if(user.whislist.indexOf(product._id) === -1){

    user.whislist.push(product._id);
 }
 else{

  user.whislist.splice(user.whislist.indexOf(product._id),1);

 }
  await user.save();
  res.redirect("back");
 })
 // wishlist rendering route 

 router.get('/whislist',async function(req,res){

  let user = await userModel.findOne({username : req.session.passport.user}).populate("products");
  let product = await productModel.find().populate("sellerid");

  res.render("wishlist",{user ,product});

})
// for registering a user
router.post('/register',async function(req,res){

  var newUser = new userModel({

    username : req.body.username,
    name : req.body.name ,
    isSeller : req.body.isSeller,
    contactnumber:req.body.contactnumber,
    email:req.body.email
  })

  let  user = await userModel.register(newUser,req.body.password);
  passport.authenticate('local')(req,res, function(){
    res.redirect("/profile")
  });
})

// after registering login page ......

router.post('/login', passport.authenticate('local',{
  successRedirect : "/profile",
  failureRedirect:"/"

}),function(req,res,next){})

//for logout

router.get('/logout', function(req,res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})
// IsLoggedIn Middleware for not accesing the details by route

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}
// direct route se page change n hogaa .....
function redirecttoprofile(req,res,next){
  if(req.isAuthenticated()){
    res.redirect('/profile');
  }
  else{
    return next();
  }
}

module.exports = router;
