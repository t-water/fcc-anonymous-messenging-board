var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  var testId;
  var testId2;
  var testId3;

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('create 2 new threads(because we end up deleting 1 in the delete test)', function(done) {
        chai.request(server)
        .post('/api/threads/test')
        .send({text:'test', delete_password:'abc'})
        .end((err, res) =>{
          assert.equal(res.status, 200);
          done();
        });
        chai.request(server)
        .post('/api/threads/test')
        .send({text:'test', delete_password:'abc'})
        .end((err, res) =>{
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      
      test('most recent 10 threads with most recent 3 replies each', function(done) {
        chai.request(server)
        .get('/api/threads/test')
        .end((err, res) =>{
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isBelow(res.body.length, 11);
          assert.isArray(res.body[0].replies);
          assert.isBelow(res.body[0].replies.length, 4);
          testId = res.body[0]._id;
          testId2 = res.body[1]._id;
          done();
        });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('delete thread with good password', function(done) {
        chai.request(server)
        .delete('/api/threads/test')
        .send({thread_id:testId, delete_password:'abc'})
        .end((err, res) =>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Deleted Successfully');
          done();
        });
      });
      
      test('delete thread with bad password', function(done) {
        chai.request(server)
        .delete('/api/threads/test')
        .send({thread_id: testId2, delete_password: 'cba'})
        .end((err, res) =>{
          assert.equal(res.status, 404);
          assert.equal(res.text, 'Incorrect Password');
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      
      test('report thread', function(done) {
        chai.request(server)
        .put('/api/threads/test')
        .send({report_id:testId2})
        .end((err, res) =>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Successfully Reported');
          done();
        });
      });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test('reply to thread', function(done) {
        chai.request(server)
        .post('/api/replies/test')
        .send({thread_id: testId2, text:'a reply', delete_password:'abc'})
        .end((err, res) =>{
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      
      test('Get all replies for 1 thread', function(done) {
        chai.request(server)
        .get('/api/replies/test')
        .query({thread_id: testId2})
        .end((err, res) =>{
          assert.equal(res.status, 200);
          assert.isArray(res.body.replies);
          assert.equal(res.body.replies[res.body.replies.length-1].text, 'a reply');
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      
      test('report reply', function(done) {
        chai.request(server)
        .put('/api/threads/test')
        .send({thread_id:testId2 ,reply_id:testId2})
        .end((err, res) =>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Reported Successfully');
          done();
        });
      });
      
    });
    
    suite('DELETE', function() {
      test('delete reply with valid password', function(done) {
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: testId2 ,reply_id: testId3, delete_password: 'abc'})
        .end((err, res) =>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Reply Successfully Deleted');
          done();
        });
      });
      
      test('delete reply with bad password', function(done) {
        chai.request(server)
        .delete('/api/threads/test')
        .send({thread_id: testId2 ,reply_id: testId3, delete_password: 'cba'})
        .end((err, res) =>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
    });
  });
});
