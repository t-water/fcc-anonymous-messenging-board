'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
const threadSchema = require('../thread')

const CONNECTION_STRING = process.env.DB;
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true, useFindAndModify: false});


module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .get((req, res, next) => {
    let board = req.params.board;
    mongoose.model(board, threadSchema, board)
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
