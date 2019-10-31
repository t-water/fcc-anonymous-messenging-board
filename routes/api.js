'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
const threadSchema = require('../thread');
const Reply = require('../reply')

const CONNECTION_STRING = process.env.DB;
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true, useFindAndModify: false});


module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .get((req, res, next) => {
    let board = req.params.board;
    let Thread = mongoose.model(board, threadSchema, board);
    Thread.find({})
    .populate('replies')
    .then(threads => res.json(threads))
    // Thread.aggregate([{$project: {"threeReplies": {$slice: ["$replies", 3]}}}, {$lookup: {from: 'threeReplies', as: 'replies'}}])
    // .then(thread => {
    //   res.json(thread)
    // }, err => next(err))
    // .catch(err => next(err))
    
  })
  .post((req, res, next) => {
    let board = req.params.board;
    let Thread = mongoose.model(board, threadSchema, board);
    let newThread = new Thread(req.body)
    newThread.save()
    .then(data => {res.json(data)}, err => next(err))
    .catch(err => next(err))
  })
  .put((req, res, next) => {
    let board = req.params.board;   
    let id = req.body.thread_id;
    let Thread = mongoose.model(board, threadSchema, board)
    Thread.findByIdAndUpdate(id, {reported: true})
    .then(data => {
      res.send("Successfully Reported")
    }, err => next(err))
    .catch(err => next(err))
  })
  .delete((req, res, next) => {
    let board = req.params.board;
    let id = req.body.thread_id;
    let password = req.body.delete_password;
    let Thread = mongoose.model(board, threadSchema, board);
    Thread.findOne({_id: id})
    .then(thread => {
      thread.comparePassword(password, (err, isMatch) => {
        if(err){
          return(next(err))
        }else if(isMatch){
          Thread.findByIdAndDelete(id)
          .then(data => res.send('Deleted Successfully'), err => next(err))
          .catch(err => next(err))
        }
      })
    }, err => next(err))
    .catch(err => next(err))
  })
    
  app.route('/api/replies/:board')
  .get((req, res, next) => {
    let board = req.params.board;
  })
  .post((req, res, next) => {
    let board = req.params.board;
    let Thread = mongoose.model(board, threadSchema, board)
    let id = req.body.thread_id
    let text = req.body.text
    let password = req.body.delete_password
    Thread.findById(id)
    .then(thread => {
      let reply = new Reply({"text": text, "delete_password": password})
      reply.save()
      .then(reply => {
        thread.replies.push(reply)
        thread.save()
        .then(thread => {res.json(thread)
        }, err => next(err))
        .catch(err => next(err))
      }, err => next(err))
      .catch(err => next(err))
    }, err => next(err))
    .catch(err => next(err))
  })
  .put((req, res, next) => {
    let board = req.params.board;
  })
  .delete((req, res, next) => {
    let board = req.params.board;
  })

};
