const { createApp } = require("../app");
const axios = require("axios");
const { expect } = require("chai");
var http = require("http");
// const expect = chai.expect;
const { describe, before, after, it, beforeEach } = require("mocha");
const sqlite = require("sqlite3");

describe("CRUD Api tests", function () {
  let appserver,
    db,
    appUrl = "http://localhost:3000";

  //setup server and sqlite db before the tests
  before(function (done) {
    //:memory: creates temp db in memory
    db = new sqlite.Database(":memory:", (err) => {
      if (err) {
        console.error("DB connection error:", err);
      } else {
        db.run(
          `
                    CREATE TABLE IF NOT EXISTS customers (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      firstName TEXT NOT NULL,
                      middleName TEXT,
                      lastName TEXT NOT NULL,
                      email TEXT UNIQUE NOT NULL,
                      phoneNumber TEXT
                    )
                  `,
          function (error) {
            if (error) {
              console.error("Problem creating customers table!", error);
            }
            const app = createApp(db);
            appserver = http.createServer(app);
            appserver.listen(3000, function (error) {
              if (error) {
                console.error("Problem starting app server!", error);
                return done(error);
              }
              done();
            });
          }
        );
      }
    });
  });

  //close db and server after tests
  after(function (done) {
    appserver.close();
    db.close(done);
  });

  //clear database before each test
  beforeEach(function (done) {
    db.run("DELETE FROM customers", function (error) {
      if (error) {
        console.error("Issue clearing out customers table!");
        return done(error);
      }
      done();
    });
  });

  //Run tests suite
  describe("Home path check", function () {
    it("return 200 status with message", async function () {
      const resp = await axios.get(`${appUrl}`);
      //check response status and message
      expect(resp.status).to.equal(200);
      expect(resp.data).to.equal("Hello From REST API!");
    });
  });

  //Check adding customers endpoint
  describe("Adding Customer Tests", function () {
    it("return 200 status with message", async function () {
      let payload = {
        first: "John",
        last: "Doe",
        email: "mail@mail.com",
      };
      const resp = await axios.post(`${appUrl}/add`, payload);

      //check response status and message
      expect(resp.status).to.equal(200);
      expect(resp.data).to.have.property("id");
      expect(resp.data.email).to.equal(payload.email);
    });

    it("return 500 status for incomplete data", async function () {
      let payload = {
        first: "John",
      };

      try {
        const resp = await axios.post(`${appUrl}/add`, payload);
      } catch (error) {
        expect(error.response.status).to.equal(500);
      }
    });
  });

  //Check updaing customers endpoint
  describe("Updating Customer Tests", function () {
    it("return 200 status with message", async function () {
      let payload1 = {
        first: "John",
        last: "Doe",
        email: "mail@mail.com",
      };
      let payload2 = {
        firstName: "Jane",
        lastName: "Doe2",
      };
      const resp1 = await axios.post(`${appUrl}/add`, payload1);
      const resp = await axios.put(`${appUrl}/customer/2`, payload2);

      //check response status and message
      expect(resp1.status).to.equal(200);
      expect(resp.status).to.equal(200);
      expect(resp.data).to.equal("Customer With Id: 2 has been updated!");
    });

    it("return 404 status for customer not found", async function () {
      try {
        let payload2 = {
          firstName: "Jane",
          lastName: "Doe2",
        };
        const resp = await axios.put(`${appUrl}/customer/1`, payload2);
      } catch (error) {
        expect(error.response.status).to.equal(404);
      }
    });
  });

  //   //check getting customers endpoint
  //   describe("Home path check", function () {
  //     it("return 200 status with message", async function () {
  //       const resp = await axios.get(`${appUrl}`);
  //       //check response status and message
  //       expect(resp.status).to.equal(200);
  //       expect(resp.data).to.equal("Hello From REST API!");
  //     });
  //   });

  //   //check updating customers endpoint
  //   describe("Home path check", function () {
  //     it("return 200 status with message", async function () {
  //       const resp = await axios.get(`${appUrl}`);
  //       //check response status and message
  //       expect(resp.status).to.equal(200);
  //       expect(resp.data).to.equal("Hello From REST API!");
  //     });
  //   });

  //   //check deleting customers endpoint
  //   describe("Home path check", function () {
  //     it("return 200 status with message", async function () {
  //       const resp = await axios.get(`${appUrl}`);
  //       //check response status and message
  //       expect(resp.status).to.equal(200);
  //       expect(resp.data).to.equal("Hello From REST API!");
  //     });
  //   });
});
