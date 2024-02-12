const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
chai.use(chaiHttp);
const server = require("../server");

suite("Functional Tests", function () {
  test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/test10")
      .send({
        issue_title: "test",
        issue_text: "test",
        created_by: "test",
        assigned_to: "test",
        status_text: "test",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.issue_title, "test");
        assert.equal(res.body.issue_text, "test");
        assert.equal(res.body.created_by, "test");
        assert.equal(res.body.assigned_to, "test");
        assert.equal(res.body.status_text, "test");
        done();
      });
  });
  test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/test10")
      .send({
        issue_title: "test",
        issue_text: "test",
        created_by: "test",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.issue_title, "test");
        assert.equal(res.body.issue_text, "test");
        assert.equal(res.body.created_by, "test");
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        done();
      });
  });
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "test",
        issue_text: "",
        created_by: "",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  test("View issues on a project: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/project02")
      .send({
        issue_title: "test",
        issue_text: "test",
        created_by: "test",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, "response should be an object");

        chai
          .request(server)
          .get("/api/issues/project02")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
  });

  test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/project02")
      .send({
        issue_title: "test2",
        issue_text: "test",
        created_by: "test",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, "response should be an object");

        chai
          .request(server)
          .keepOpen()
          .get("/api/issues/project02?issue_title=test2")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
  });
  test("View issues on a project with two filter: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/project02")
      .send({
        issue_title: "test3",
        issue_text: "test3",
        created_by: "test",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, "response should be an object");

        chai
          .request(server)
          .get("/api/issues/project02?isssue_title=test3&issue_text=test3")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
  });
  test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/test_fixed")
      .send({
        _id: "645c2318df1c030437cdab61",
        issue_title: "updated",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, "645c2318df1c030437cdab61");
        done();
      });
  });
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/test_fixed")
      .send({
        _id: "645c2318df1c030437cdab61",
        issue_title: "updated",
        issue_text: "updated",
        created_by: "updated",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, "645c2318df1c030437cdab61");
        done();
      });
  });
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({
        issue_title: "updated",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/test_fixed")
      .send({
        _id: "645c2318df1c030437cdab61",
        issue_title: "",
        issue_text: "",
        created_by: "",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "no update field(s) sent");
        assert.equal(res.body._id, "645c2318df1c030437cdab61");
        done();
      });
  });
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({
        _id: "5871dda29faedc3491ff93bb",
        issue_title: "updated",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, "5871dda29faedc3491ff93bb");
        done();
      });
  });
  test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
    this.timeout(3000);

    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/delete")
      .send({
        issue_title: "test",
        issue_text: "test",
        created_by: "test",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");

        let idTest = res.body._id;

        chai
          .request(server)
          .keepOpen()
          .delete("/api/issues/delete")
          .send({
            _id: idTest,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, "application/json");
            assert.equal(res.body.result, "successfully deleted");
            done();
          });
      });
  });
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
    this.timeout(3000);

    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/delete")
      .send({
        _id: "5871dda29faedc3491ff93bb",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, "5871dda29faedc3491ff93bb");
        done();
      });
  });
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/delete")
      .send({
        _id: "",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
