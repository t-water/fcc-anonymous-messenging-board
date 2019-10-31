'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
const threadSchema = require('../thread');
// const Reply = require('../reply')

const CONNECTION_STRING = process.env.DB;
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true, useFindAndModify: false});


module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .get((req, res, next) => {
    let board = req.params.board;
    let Thread = mongoose.model(board, threadSchema, board);
    Thread.aggregate([{$limit: 10}, {$project: {delete_password: 0, reported: 0}}, {$sort: {'bumped_on': -1}}])
    .then(threads => {
      Thread.populate(threads, {path: 'replies', select: '-delete_password -reported', options: {limit: 3, sort: {'bumped_on': -1}}})
      .then(threads => res.json(threads))
    })
    
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
        thread.replies.push({"text": text, "delete_password": password})
        thread.save()
        .then(thread => {
          res.json(thread)
        }, err => next(err))
        .catch(err => next(err))
      .catch(err => next(err))
    }, err => next(err))
    .catch(err => next(err))
  })
 
  .put((req, res, next) => {
    let board = req.params.board;
    let thread_id = req.body.thread_id;
    let reply_id = req.body.reply_id;
    let Thread = mongoose.model(board, threadSchema, board);
    Thread.findOne({_id: thread_id})
    .then(thread => {
      let reply = thread.replies.filter(x => x['_id'] == reply_id)[0]
      reply.reported = true;
      thread.save()
      .then(thread => {res.json("Reported Successfully")},
      err => next(err))
      .catch(err => next(err))
    }, err => next(err))
    .catch(err => next(err))
  })
  
  .delete((req, res, next) => {
    let board = req.params.board;
  })

};
