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

threadSchema.pre('save', function(next){
  var user = this;
  if(!user.isModified('delete_password')){
    return next();
  }
  bcrypt.genSalt(saltWorkFactor, (err, salt) => {
    if(err){
      return next(err)
    }
    bcrypt.hash(user.delete_password, salt, (err, hash) =>{
      if(err){
        return next(err)
      }
      user.delete_password = hash
      next()
    })
  })
})

threadSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.delete_password, function(err, isMatch) {
        if(err){
          return cb(err);
        } 
        cb(null, isMatch);
    });
};

module.exports(threadSchema)