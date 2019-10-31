const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const saltWorkFactor = 10;

const threadSchema = new Schema({
  text: {type: String, required: true},
  reported: {type: Boolean, default: false},
  delete_password: {type: String, required: true},
  replies: {type: [String]}
  
},{
  timestamps: true
})

threadSchema.pre('save', function next(){
  var user = this;
  if(!user.isModified('delete_password')){
    return next();
  }
  bcrypt.genSalt(saltWorkFactor, (err, salt) => {
    if(err){
      return next(err)
    }
    brcypt.hash()
  })
})