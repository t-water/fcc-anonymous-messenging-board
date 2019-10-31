'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
const threadSchema = require('../thread');

const CONNECTION_STRING = process.env.DB;
mongoose.connect(CONNECTION_STRING.concat('/fcc_anonymous_message_board'), {useNewUrlParser: true, useFindAndModify: false});


module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .get((req, res, next) => {
    let board = req.params.board;
    
  })
  .post((req, res, next) => {
    let board = req.params.board;
    let Thread = mongoose.model(board, threadSchema, board);
    let newThread = new Thread(req.body)
    newThread.save()
    .then(data => res.json(data))
    .catch(err => next(err))
    
  })
  .put((req, res, next) => {
    let board = req.params.board;
  })
  .delete((req, res, next) => {
    let board = req.params.board;
  })
    
  app.route('/api/replies/:board')
  .get((req, res, next) => {
    let board = req.params.board;
  })
  .post((req, res, next) => {
    let board = req.params.board;
  })
  .put((req, res, next) => {
    let board = req.params.board;
  })
  .delete((req, res, next) => {
    let board = req.params.board;
  })

};
