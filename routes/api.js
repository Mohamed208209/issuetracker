'use strict';
const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  project: {
    type: String,
    required: true
  },
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  updated_on: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: {
    type: String,
    default: ''
  },
  open: {
    type: Boolean,
    default: true
  },
  status_text: {
    type: String,
    default: ''
  }
});


const issueModel = mongoose.model('project', issueSchema);

module.exports = function (app) {

    app.route('/api/issues/:project')

    .get(function (req, res){
      let project = req.params.project;
      const query = req.query;
      query.project = project;

      issueModel
        .find(query)
        .then((list) => {
          const reorderList = list.map((issue) => {
            return {
              _id: issue._id,
              issue_title: issue.issue_title,
              issue_text: issue.issue_text,
              created_on: issue.created_on,
              updated_on: issue.updated_on,
              created_by: issue.created_by,
              assigned_to: issue.assigned_to,
              open: issue.open,
              status_text: issue.status_text
            }
          })

          res.send(reorderList);
        })
        .catch((error) => {
          console.error('Error retrieving response:', error);
        });
    })

    .post(function (req, res){
      let project = req.params.project;

      const issue = new issueModel({
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text
      });

      issue.save((error, data) => {
        return error ? res.json({ error: 'required field(s) missing' }) : res.json({
          _id: issue._id,
          issue_title: issue.issue_title,
          issue_text: issue.issue_text,
          created_on: issue.created_on,
          updated_on: issue.updated_on,
          created_by: issue.created_by,
          assigned_to: issue.assigned_to,
          open: issue.open,
          status_text: issue.status_text
        });
      });
    })

    .put(function (req, res) {
      let project = req.params.project;
      const body = req.body;
      let _id = body._id;

      if (_id) {
        function isEmpty(obj) {
          for (let prop in obj) {
            if (prop != '_id' && obj[prop]) {
              return false;
            }
          }
          return true;
        }
        if (isEmpty(body)) {
          return res.json({ error: 'no update field(s) sent', '_id': _id });
        }

        issueModel.updateOne(
          { _id: _id, project: project },
          { $set: { ...body }, updated_on: new Date() }
        )
          .then((result) => {
            if (result.nModified === 0) {
              return res.json({ error: 'could not update', '_id': _id });
            }
            return res.json({ result: 'successfully updated', '_id': _id });
          })
          .catch((error) => {
            console.log(error);
          });

      } else {
        return res.json({ error: 'missing _id' });
      }
    })

    .delete(function (req, res){
      let project = req.params.project;
      let _id = req.body._id;

      if (_id) {
        issueModel.deleteOne({ _id: _id, project: project })
          .then((result) => {
            if (result.deletedCount != 1) {
              return res.json({ error: 'could not delete', '_id': _id });
            }
            return res.json({ result: 'successfully deleted', '_id': _id });
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        return res.json({ error: 'missing _id' });
      }
    });  
};
