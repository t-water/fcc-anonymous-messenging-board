const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const saltWorkFactor = 10;

const replySchema = new Schema({
  text: {type: String, required: true},
  delete_password: {type: String, required: true},
  reported: {type: Boolean, default: false}
},{
  timestamps: {'createdAt': 'created_on', 'updatedAt': 'bumped_on' }
})

replySchema.pre('save', function(next){
  var reply = this;
  if(!reply.isModified('delete_password')){
    return next();
  }
  bcrypt.genSalt(saltWorkFactor, (err, salt) => {
    if(err){
      return next(err)
    }
    bcrypt.hash(reply.delete_password, salt, (err, hash) =>{
      if(err){
        return next(err)
      }
      reply.delete_password = hash
      next()
    })
  })
})

replySchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.delete_password, function(err, isMatch) {
        if(err){
          return cb(err);
        } 
        cb(null, isMatch);
    });
};

const Reply = mongoose.model('Reply', replySchema)

module.exports = Reply;