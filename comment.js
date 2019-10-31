const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const saltWorkFactor = 10;

const commentSchema = new Schema({
  text: {type: String, required: true},
  delete_password: {type: String, required: true},
  reported: {type: Boolean, default: false}
},{
  timestamps: true
})

commentSchema.pre('save', function(next){
  var comment = this;
  if(!comment.isModified('delete_password')){
    return next();
  }
  bcrypt.genSalt(saltWorkFactor, (err, salt) => {
    if(err){
      return next(err)
    }
    bcrypt.hash(comment.delete_password, salt, (err, hash) =>{
      if(err){
        return next(err)
      }
      comment.delete_password = hash
      next()
    })
  })
})

commentSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.delete_password, function(err, isMatch) {
        if(err){
          return cb(err);
        } 
        cb(null, isMatch);
    });
};

module.exports = commentSchema;