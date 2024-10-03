const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { isObjectIdOrHexString } = require('mongoose');
const mongoose = require('mongoose');

chai.use(chaiHttp);
let deleteID, deleteID1;


suite('Functional Tests', function() {
    this.timeout(5000);
    suite('Integration tests with chai-http', function () {
        test('Post Request', function(done) {
            chai
            .request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({"issue_title": "Fix error in posting data",
                   "issue_text": "When we post data it has an error.",
                   "created_by": "Eric",
                   "assigned_to": "Eric",
                   "status_text": "In QA"
                })
            .end(function(err, res) {
                deleteID = res.body._id
                assert.equal(res.status, 200);
                assert.equal(res.type, "application/json");
                assert.equal(res.body.open, true)
                assert.property(res.body, 'created_on')
            })
            done();
        })
        test('Post Request with required fields', function(done) {
            chai
            .request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({"issue_title": "Fix error in posting data",
                   "issue_text": "When we post data it has an error.",
                   "created_by": "Eric",
                   "assigned_to": "Eric",
                   "status_text": "In QA"
                })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type, "application/json");
                assert.equal(res.body.open, true);
                assert.property(res.body, 'created_on');
                assert.equal(res.body.issue_title, "Fix error in posting data");
                assert.equal(res.body.issue_text, "When we post data it has an error.");
                assert.equal(res.body.created_by, "Eric");
            })
            done();
        })

        test('Post Request with missing required fields', function(done) {
            chai
            .request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({"issue_title": "Fix error in posting data",
                   "issue_text": "When we post data it has an error."
                })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type, "application/json");
                assert.equal(res.body.error, 'required field(s) missing');
            })
            done();
        })

        test('Get Request', function(done) {
            chai
            .request(server)
            .keepOpen()
            .get('/api/issues/test')
            .query({})
            .end(function(err, res) {
                assert.equal(res.status, 200)
                assert.isArray(res.body)
            })

            done();
        })

        test('Get Request with one filter', function(done) {
            chai
            .request(server)
            .keepOpen()
            .get('/api/issues/test')
            .query({'project': 'test'})
            .end(function(err, res) {
                // console.log(res.body)
                assert.equal(res.status, 200)
                assert.isArray(res.body)
                assert.isObject(res.body[0])
                assert.equal(res.body[0].project, 'test');
                assert.property(res.body[0], 'created_on');
                assert.property(res.body[0], 'updated_on');
            })
            done();
        })

        test('Get Request with multiple filters', function(done) {
            chai
            .request(server)
            .keepOpen()
            .get('/api/issues/test')
            .query({'project': 'test', 'issue_title': 'Fix error in posting data', 'issue_text': 'When we post data it has an error.'})
            .end(function(err, res) {
                assert.equal(res.status, 200)
                assert.isArray(res.body)
                assert.isObject(res.body[0])
                assert.equal(res.body[0].project, 'test');
                assert.property(res.body[0], 'created_on');
                assert.property(res.body[0], 'updated_on');
                assert.property(res.body[0], 'issue_title');
                assert.property(res.body[0], 'issue_text');
                assert.equal(res.body[0].issue_title, 'Fix error in posting data');
                assert.equal(res.body[0].issue_text, 'When we post data it has an error.');
            })
            done();
        })

        test('Put Request one field', function(done) {
            chai
            .request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({'_id': '66f5ea61a9d3f1dc92861dd1', 'status_text': 'in staging'})
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated')
            })
            done();
        })

        test('Put Request multiple fields', function(done) {
            chai
            .request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({'_id': '66f60cb5d0c873c38076eea4', 'status_text': 'in staging', 'assigned_to': 'Bob','open': false})
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated')
            })
            done();
        })

        test('Put Request missing _id', function(done) {
            chai
            .request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({ 'status_text': 'in staging', 'assigned_to': 'Bob','open': false})
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "missing _id")
            })
            done();
        })

        test('Put Request missing update fields', function(done) {
            chai
            .request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({'_id': '66f60e8e43e672250f20cf7e'})
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'no update field(s) sent')
            })
            done();
        })

        test('Put Request with invalid id', function(done) {
            chai
            .request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({'_id': '66f60e8e43e6', 'status_text': 'in staging', 'assigned_to': 'Bob','open': false})
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not update')
            })
            done();
        })

        test('delete request', function(done) {
            chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .send({'project': 'test', '_id': deleteID})
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully deleted')
            })
            done();
        })

        test('delete request with invalid id', function(done) {
            let invalidID = new mongoose.Types.ObjectId();
            chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .send({_id: invalidID})
            .end(function(err, res) {
                console.error(err)
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not delete')
            })
            done();
        })

        test('delete request with no id', function(done) {
            chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .send({})
            .end(function(err, res) {
                console.error(err)
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id')
            })
            done();
        })

    })

});
