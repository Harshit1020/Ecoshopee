const multer = require("multer")
const path = require('path');
const crypto = require('crypto')

const userImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads/userimages')
    },
    filename:function (req, file, cb) {
    
        crypto.randomBytes(14, function(err, buff){

            var fn = buff.toString("hex") + path.extname(file.originalname);
            cb(null,fn)

        })
    }
  })
  
  const productImagesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads/productimages')
    },
    filename: function (req, file, cb) {
    
        crypto.randomBytes(14, function(err, buff){

            var fn = buff.toString("hex") + path.extname(file.originalname);
            cb(null,fn)

        })
    }
  })
 
module.exports = {userImageStorage , productImagesStorage}
