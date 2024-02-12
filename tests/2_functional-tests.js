const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Issues = require("../models/issues.js");
const { afterEach, after, before } = require("mocha");

chai.use(chaiHttp);

function clearDatabase() {
  Issues.deleteMany({}, function (error, data) {
    if (error) return;
    if (data) return;
  });
}

function printChanges() {
  Issues.find(
    { _id: { $in: [idForPut, idForPost1, idForPost2] } },
    (err, data) => {
      if (err) return console.log(err);
      console.log(data);
    },
  );
}

suite("Functional Tests", function () {
  this.timeout(5000);

  suite("Integration tests with chai-http", function () {
    var idForPut = null;
    var idForPost1 = null;
    var idForPost2 = null;

    // Hootk to set up the environment with one database entry
    before(function () {
      const newIssue = new Issues({
        project_title: "apitest",
        issue_title: "Test",
        issue_text: "Test",
        created_by: "MochaChaiTestingSuite",
        assigned_to: "Test",
        status_text: "Test",
      });

      newIssue.save((error, data) => {
        if (error) return console.log(error);
        idForPut = data._id.valueOf();
      });
    });

    // Hook to delete all the database entries created for the tests in this file
    after(function () {
      Issues.find({}, (err, data) => {
        if (err) return console.log(err);
        //if (data) console.log(data);
      });

      Issues.deleteMany(
        { _id: { $in: [idForPut, idForPost1, idForPost2] } },
        (err, data) => {
          if (err) return console.log(err);
          //console.log(data);
        },
      );

      //clearDatabase();
    });

    afterEach(function () {
      //printChanges();
    });

    // #1 Create an issue with every field
    test("#1 Create an issue with every field", function (done) {
      chai
        .request(server)
        .post(
          "/api/issues/apitest?issue_title=Test 1687&issue_text=Test 4567&created_by=Test123456&assigned_to=Test123456&status_text=Check It Now!!!",
        )
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.issue_title, "Test 1687");
          assert.equal(res.body.issue_text, "Test 4567");
          assert.equal(res.body.created_by, "Test123456");
          assert.equal(res.body.assigned_to, "Test123456");
          assert.equal(res.body.status_text, "Check It Now!!!");
          idForPost1 = res.body._id;
          done();
        });
    });

    // #2 Create an issue with only required fields
    test("#2 Create an issue with only required fields", function (done) {
      chai
        .request(server)
        .post(
          "/api/issues/apitest?issue_title=Test 1688&issue_text=Unauthorized&created_by=Emma",
        )
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.issue_title, "Test 1688");
          assert.equal(res.body.issue_text, "Unauthorized");
          assert.equal(res.body.created_by, "Emma");
          idForPost2 = res.body._id;
          done();
        });
    });

    // #3 Create an issue with missing required fields
    test("#3 Create an issue with missing required fields", function (done) {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });

    // #4 View issues on a project
    test("#4 View issues on a project", function (done) {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          done();
        });
    });

    // #5 View issues on a project with one filter
    test("#5 View issues on a project with one filter", function (done) {
      chai
        .request(server)
        .get("/api/issues/apitest?open=false")
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          done();
        });
    });

    // #6 View issues on a project with multiple filters
    test("#6 View issues on a project with multiple filters", function (done) {
      chai
        .request(server)
        .get("/api/issues/apitest?open=true&created_by=John")
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          done();
        });
    });

    // #7 Update one field on an issue
    test("#7 Update one field on an issue", function (done) {
      chai
        .request(server)
        .put(`/api/issues/apitest`)
        .send({
          _id: idForPut,
          issue_title: "Test 1687",
        })
        .then((res) => {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.result, "successfully updated");
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    // #8 Update multiple fields on an issue
    test("#8 Update multiple fields on an issue", function (done) {
      chai
        .request(server)
        .put(`/api/issues/apitest`)
        .send({
          _id: idForPut,
          issue_title: "Error 12345678",
          assigned_to: "Ingrid",
        })
        .then((res) => {
          //console.log(res.body);
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.result, "successfully updated");
          done();
        })
        .catch((err) => {
          throw err;
        });
    });

    // #9 Update an issue with missing _id
    test("#9 Update an issue with missing _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/apitest?issue_title=Error 401")
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });

    // #10 Update an issue with no fields to update
    test("#10 Update an issue with no fields to update", function (done) {
      chai
        .request(server)
        .put(`/api/issues/apitest`)
        .send({
          _id: idForPut,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        });
    });

    // #11 Update an issue with an invalid _id
    test("#11 Update an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/apitest?")
        .send({
          _id: "112",
          issue_text: "Errorrrrrrrr",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, "112");
          done();
        });
    });

    // #12 Delete an issue
    test("#12 Delete an issue", function (done) {
      chai
        .request(server)
        .delete(`/api/issues/apitest?_id=${idForPut}`)
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.result, "successfully deleted");
          done();
        });
    });

    // #13 Delete an issue with an invalid _id
    test("#13 Delete an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({
          _id: "122",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, "122");
          done();
        });
    });

    // #14 Delete an issue with missing _id
    test("#14 Delete an issue with missing _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .end(function (err, res) {
          assert.equal(res.status, 200, "Response status should be 200");
          assert.equal(
            res.type,
            "application/json",
            "Response should be of type json",
          );
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
