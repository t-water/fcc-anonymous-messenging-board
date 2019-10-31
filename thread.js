const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const saltWorkFactor = 10;

const threadSchema = new Schema({
  text: {type: String, required: true},
  reported: {type: Boolean, default: false},
  delete_password: {type: String, required: true},
  replies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Reply'}]
  
},{
  timestamps: {'createdAt': 'created_on', 'updatedAt': 'bumped_on'}  
})

threadSchema.pre('save', function(next){
  var thread = this;
  if(!thread.isModified('delete_password')){
    return next();
  }
  bcrypt.genSalt(saltWorkFactor, (err, salt) => {
    if(err){
      return next(err)
    }
    bcrypt.hash(thread.delete_password, salt, (err, hash) =>{
      if(err){
        return next(err)
      }
      thread.delete_password = hash
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

module.exports = threadSchema