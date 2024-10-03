'use strict';
const mongoose = require("mongoose");


module.exports = function (app) {
  
  const database = process.env["MONGO_URI"];
  mongoose.connect(database).then(() => console.log("connected to database"));

  const projectIssueSchema = new mongoose.Schema({
    project: String,
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
    created_by: { type: String, required: true },
    assigned_to: { type: String, default: "" },
    open: { type: Boolean, default: true },
    status_text: { type: String, default: "" },
  });

  const projectIssue = mongoose.model("ProjectIssue", projectIssueSchema);


  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      let reqQuery = req.query;
      let projectIssues

      
      if (!reqQuery) {
        projectIssues = await projectIssue.find({ project: project });
      } else {
        projectIssues = await projectIssue.find({ ...req.query, project: project });
      }

      res.json(projectIssues);
    })
    
    .post(function (req, res){
      let project = req.params.project;

      if (req.body.issue_title  && req.body.issue_text && req.body.created_by) {

        let postIssue = new projectIssue({
          project: project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          status_text: req.body.status_text,
          open: true,
        });

        postIssue.save();
        res.json(postIssue);
      } else {
        res.json({ error: 'required field(s) missing' });
      }
      
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      let {_id, issue_title, issue_text, created_by, assigned_to, status_text, open} = req.body;
      
      if (!_id) {
        res.json({ error: "missing _id" });
      } else {

          let putObject = {};

          if  (issue_title) {
          putObject['issue_title'] = issue_title;
          }

          if (issue_text) {
            putObject['issue_text'] = issue_text;
          }

          if (created_by) {
            putObject['created_by'] = created_by;
          }

          if (assigned_to) {
            putObject['assigned_to'] = assigned_to;
          }

          if (status_text) {
            putObject['status_text'] = status_text;
          }

          if (open) {
            putObject['open'] = open;
          }

          let count = 0
          Object.keys(putObject).forEach((key) => {
            if (putObject[key]) {
              count++;
            }
          });

          console.log(count, 'count')
          if (Object.keys(putObject).length == 0) {
            console.log('1')
            res.json({ error: "no update field(s) sent", _id: req.body._id });
          } else if (count == 0) {
            res.json({ error: 'could not update', '_id': req.body._id })
          } else {
              try {
                let queryResult = await projectIssue.findOneAndUpdate(
                {_id: _id, project: project},
                { ...req.body, updated_on: new Date() },
                { new: true }, )
                console.log('2')
                queryResult.save();
                res.json({ result: 'successfully updated', '_id': queryResult._id })
 
            } catch(err) {
                console.log("3")
                res.json({ error: 'could not update', '_id': _id })
            } 

          }
        }

    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      let deleteID = req.body._id;
      
      if (!deleteID) {
        res.json({ error: 'missing _id' });
      } else {
        let deleteItem = await projectIssue.deleteOne({ project: project, _id: deleteID});

        
        if (!deleteItem.deletedCount) {
          res.json({ error: 'could not delete', '_id': deleteID })
        } else {
          res.json({ result: 'successfully deleted', '_id': deleteID })
        }
      }

    });
    
};
