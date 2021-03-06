'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
const threadSchema = require('../thread');

const CONNECTION_STRING = process.env.DB;
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true});


module.exports = function(app) {
  app.route('/api/threads')
  .get((req, res, next) => {
    mongoose.connection.db.listCollections().toArray((err, names) => {
      if(err){
        res.statusCode = 404;
        res.json('Collections could not be retrieved.')
      }else{
        res.json(names)
      }
    })
  })
  
  app.route('/api/threads/:board')
  .get((req, res, next) => {
    let board = req.params.board.toLowerCase();
    let Thread = mongoose.model(board, threadSchema, board);
    Thread.aggregate([
      {
        $limit: 10
      },
      {
        $project: {delete_password: 0, 'replies.delete_password': 0}
      },
      {
        $sort: {'bumped_on': -1}
      }
    ])
    .then(aggregated_threads => {
      aggregated_threads.forEach(x => {
        x.reply_count = x.replies.length
        x.replies = x.replies.sort((a,b) => {
          if(a.created_on < b.created_on){
            return 1;
          }else if(a.created_on > b.created_on){
            return -1;
          }else{
            return 0
          }
        })
        x.replies = x.replies.slice(0,3)
      })
      res.json(aggregated_threads)
    })
    
  })
  
  .post((req, res, next) => {
    let board = req.params.board.toLowerCase().trim();
    let Thread = mongoose.model(board, threadSchema, board);
    let newThread = new Thread(req.body)
    newThread.save()
    .then(data => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/text')
      res.send('Thread Posted Successfully')
    }, err => {
      res.statusCode = 500;
      res.send('Thread Failed To POST');
    })
    .catch(err => {
      res.statusCode = 500;
      res.send('Thread Failed To POST');
    })
  })
  
  .put((req, res, next) => {
    let board = req.params.board.toLowerCase();   
    let id = req.body.report_id;
    let Thread = mongoose.model(board, threadSchema, board)
    Thread.findOne({_id: id})
    .then(foundThread => {
      if(foundThread.reported){
        res.statusCode = 200;
        res.send('This thread has already been reported.')
      }else{
        Thread.findByIdAndUpdate(id, {reported: true})
        .then(threadToReport => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/text')
            res.send("Successfully Reported")
        }, err => {
          res.statusCode = 500;
          res.send('Could not report thread with ID: ' + id)
        })
        .catch(err => {
          res.statusCode = 500;
          res.send('Could not report thread with ID: ' + id)
        })
      }
    }, err => {
      res.statusCode = 500;
      res.send('Could not find thread with ID: ' + id)
    })
    .catch(err => {
      res.statusCode = 500;
      res.send('Could not find thread with ID: ' + id)
    })

  })
  
  .delete((req, res, next) => {
    let board = req.params.board.toLowerCase();
    let id = req.body.thread_id;
    let password = req.body.delete_password;
    let Thread = mongoose.model(board, threadSchema, board);
    Thread.findOne({_id: id})
    .then(thread => {
      thread.comparePassword(password, (err, isMatch) => {
        if(err){
          res.statusCode = 500;
          res.send('Could not delete thread with ID: ' + id)
        }else if(isMatch){
          Thread.findByIdAndDelete(id)
          .then(data => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/text')
            res.send('Deleted Successfully')
          }, err => {
            res.statusCode = 500;
            res.send('Could not delete thread with ID: ' + id)
          })
          .catch(err => {
            res.statusCode = 500;
            res.send('Could not delete thread with ID: ' + id)
          })
        }else{
          res.statusCode = 404;
          res.send('Incorrect Password')
        }
      })
    }, err => {
      res.statusCode = 500;
      res.send('Could not find thread with ID: ' + id)
    })
    .catch(err => {
      res.statusCode = 500;
      res.send('Could not find thread with ID: ' + id)
    })
  })
    
  app.route('/api/replies/:board')
  .get((req, res, next) => {
    let board = req.params.board.toLowerCase();
    let Thread = mongoose.model(board, threadSchema, board)
    let thread_id = mongoose.Types.ObjectId(req.query.thread_id)
    Thread.findOne({_id: thread_id})
    .then(thread => {
      if(thread != null){
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(thread)
      }else{
        res.statusCode = 404;
        res.send('Could not find thread: ' + thread_id + ' in board: ' + req.params.board)
      }
    }, err => {
        res.statusCode = 301;
        res.redirect('/api/threads/'+board)
      res.statusCode = 500;
      res.send('Could not find thread: ' + thread_id + ' in board: ' + req.params.board)
    })
    .catch(err => {
         res.statusCode = 301;
         res.redirect('/api/threads/'+board) 
      res.statusCode = 500;
      res.send('Could not find thread: ' + thread_id + ' in board: ' + req.params.board)
    })
  })
  
  .post((req, res, next) => {
    let board = req.params.board.toLowerCase();
    let Thread = mongoose.model(board, threadSchema, board)
    let id = req.body.thread_id
    let text = req.body.text
    let password = req.body.delete_password
    Thread.findById(id)
    .then(thread => {
      if(thread != null){
        thread.replies.push({"text": text, "delete_password": password})
        thread.save()
        .then(threadWithReply => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json')
          res.json(threadWithReply)
        }, err => {
          res.statusCode = 500;
          res.send('Error Saving Reply')
        })
        .catch(err => {
          res.statusCode = 500;
          res.send('Error Saving Reply')
        })
      }else{
        res.statusCode = 404;
        res.send('Could not find thread with ID: ' + req.body.thread_id)
      }
    }, err=> {
      res.statusCode = 500;
      res.send('Server Error When Attempting to Find Thread with ID: ' + req.body.thread_id)
    })
    .catch(err => {
      res.statusCode = 500;
      res.send('Server Error When Attempting to Find Thread with ID: ' + req.body.thread_id)
    })
  })
 
  .put((req, res, next) => {
    let board = req.params.board.toLowerCase();
    let thread_id = req.body.thread_id;
    let reply_id = req.body.reply_id;
    let Thread = mongoose.model(board, threadSchema, board);
    Thread.findOne({_id: thread_id})
    .then(thread => {
      if(thread != null){
        let reply = thread.replies.id(reply_id)
        if(!reply.reported){
          reply.reported = true;
          thread.save()
          .then(thread => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/text')
            res.json("Reported Successfully")
          },
          err => {
            res.statusCode = 500;
            res.send('Could not report reply with ID: ' + reply_id)
          })
          .catch(err => {
            res.statusCode = 500;
            res.send('Could not report reply with ID: ' + reply_id)
          })
        }else{
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/text')
          res.send('This reply has already been reported')
        }
      }else{
        res.statusCode = 404;
        res.send('Could not find thread with ID: ' + thread_id)
      }
    }, err => {
      res.statusCode = 500;
      res.send('Could not find thread with ID: ' + thread_id)
    })
    .catch(err => {
      res.statusCode = 500;
      res.send('Could not find thread with ID: ' + thread_id)
    })
  })
  
  .delete((req, res, next) => {
    let board = req.params.board.toLowerCase();
    let thread_id = req.body.thread_id;
    let reply_id = req.body.reply_id;
    let Thread = mongoose.model(board, threadSchema, board);
    let password = req.body.delete_password
    Thread.findOne({_id: thread_id})
    .then(thread=> {
      let reply = thread.replies.id(reply_id)
      reply.comparePassword(password, (err, isMatch) => {
        if(err){
          return next(err)
        }else if(isMatch){
          reply.remove()
          thread.save()
          .then(thread => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/text')
            res.json('Reply Successfully Deleted')
          }, err => {
            res.statusCode = 500;
            res.send('Could not delete reply with ID: ' + reply_id)
          })
          .catch(err => {
            res.statusCode = 500;
            res.send('Could not delete reply with ID: ' + reply_id)
          })
        }else{
          res.statusCode = 404;
          res.send('Incorrect Password')
        }
      })
    }, err => {
      res.statusCode = 500;
      res.send('Could not delete reply with ID: ' + reply_id)
    })
    .catch(err => {
      res.statusCode = 500;
      res.send('Could not delete reply with ID: ' + reply_id)
    })
  })

};
