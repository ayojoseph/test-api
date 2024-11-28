function createApp(db) {
  var express = require("express");
  var sqlite = require("sqlite3");

  var logger = require("morgan");

  var app = express();

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  if (!db) {
    db = new sqlite.Database("testdb.sqlite");
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      middleName TEXT,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phoneNumber TEXT
    )
  `);

  app.get("/", function (req, res) {
    res.status(200).send("Hello From REST API!");
  });
  //Delete a customer
  app.delete("/customer/:id", function (req, res) {
    db.run(
      `DELETE FROM customers WHERE id = ?`,
      req.params.id,
      function (error) {
        if (error) {
          res.status(500).send({ error });
          return;
        }
        if (this.changes === 0) {
          res.status(404).send({ error: "Customer Not Found in Database!" });
          return;
        }
        res
          .status(200)
          .send(`Customer With Id: ${req.params.id} has been Deleted! :'(`);
      }
    );
  });

  //update a customer
  app.put("/customer/:id", function (req, res) {
    // const { firstName, middleName, lastName, email, phoneNumber} = req.body;

    var vals = [],
      toUpdate = [];
    for (field in req.body) {
      toUpdate.push(field + " = ?");
      vals.push(req.body[field]);
    }
    vals.push(req.params.id);
    // var query =
    db.run(
      `UPDATE customers SET ${toUpdate.join(", ")} WHERE id = ?`,
      vals,
      function (error) {
        if (error) {
          res.status(500).send({ errorMessage: error.message });
          return;
        }
        if (this.changes === 0) {
          res.status(404).send({ error: "Customer Not Found in Database!" });
          return;
        }
        res
          .status(200)
          .send(`Customer With Id: ${req.params.id} has been updated!`);
      }
    );

    // res.status(200).send("Hello From REST API!");
  });
  //fetch all rows of customers
  app.get("/customers", function (req, res) {
    db.all("Select * from customers", [], function (error, rows) {
      if (error) {
        res.status(500).send({ errorMessage: error.message });
        return;
      }
      res.status(200).send({ rows });
    });
    // res.status(200).send("Hello From REST API!");
  });
  //add a customer to customers table
  app.post("/add", function (req, res) {
    const { first, last, email } = req.body;
    let middle = "",
      phone = "";
    if (req.body.phone) {
      phone = req.body.phone;
    }
    if (req.body.middle) {
      middle = req.body.middle;
    }

    // console.log(`First: ${first}, Last: ${last}, Email: ${email}`);
    // console.log(`Phone: ${phone}, Middle: ${middle}`);

    db.run(
      "INSERT INTO customers (firstName, middleName, lastName, email, phoneNumber) VALUES  (?, ?, ?, ?, ?)",
      [first, middle, last, email, phone],
      function (error) {
        if (error) {
          res.status(500).send({ errorMessage: error.message });
        } else {
          res.status(200).send({
            id: this.lastID,
            fistName: first,
            email: email,
          });
        }
      }
    );
    // res.status(200).send("Hello From REST API!");
  });

  return app;
}

module.exports = {
  createApp,
  app: createApp(),
};
