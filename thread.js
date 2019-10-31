const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const threadSchema = new Schema({
  text: {
    type: String,
    required: true
  }
},{
  timestamps: true
})