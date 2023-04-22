var express = require("express");
var mssql = require("mssql");
var pdf = require("html-pdf");
var ip = require("ip");

var redis = require("redis");
var redisClient = redis.createClient(6379, "192.168.1.3");

redisClient.on("connect", function () {
  console.log("Connected to redis database.");
});

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;

app.listen(port, function () {
  console.log("listening on port:" + port);
});

app.post("/saveData", function (req, res) {
  console.log(req.body);
  var request = new mssql.Request();
  var img = ip.address() + ":" + port;
  request.query(
    "Insert into register VALUES ('" +
      req.body.data.name +
      "', '" +
      req.body.data.city +
      "','" +
      img +
      "')"
  );
  res.json({ response: "Datos guardados correctamente." });
});

var config = {
  user: "SA",
  password: "Ab12345678",
  server: "192.168.1.3",
  port: 1433,
  database: "cases",
  options: {
    trustedConnection: true,
    enableArithAbort: true,
  },
};

var connection = mssql.connect(config, function (err, res) {
  if (err) {
    throw err;
  } else {
    console.log("Connected to sql server database.");
  }
});

app.get("/download/:city", function (req, res, next) {
  getCity(res, next, req.params.city);
});

function getCity(res, next, city) {
  var request = new mssql.Request();
  request.query(
    `Select * from register where city='${city}'`,
    function (err, result) {
      if (err) {
        return next(err);
      } else {
        var data = result.recordset;
        createPDF(res, city, data);
      }
    }
  );
}

function createPDF(res, city, data) {
  var list = "<p>Personas afectadas:<p>";
  var count = 0;
  data.forEach((element) => {
    count++;
    list = list + `<p>${element.name}<p>`;
  });
  const content = getHead(city) + list + getFooter(city, count);
  setCache(city, count);
  buildPDF(res, content);
}

function setCache(city, count) {
  redisClient.hmset("register", city, count);
}

app.get("/database", function (req, res) {
  getDatabaseCache(res);
});

function getDatabaseCache(res) {
  redisClient.hgetall("register", function (err, data) {
    if (data != null) {
      var keys = Object.keys(data);
      var values = Object.values(data);
      var database = [];
      for (let index = 0; index < keys.length; index++) {
        database.push({ label: keys[index], y: parseInt(values[index], 10) });
      }
      JSON.stringify({ array: database });
      res.send(database);
    }
  });
}

function buildPDF(res, content) {
  pdf.create(content).toFile("./covid-cases.pdf", function (err, path) {
    if (err) {
      console.log(err);
    } else {
      sendPDF(res);
    }
  });
}

function sendPDF(res) {
  res.sendFile(__dirname + "/covid-cases.pdf");
}

function getHead(city) {
  const head = `
    <!doctype html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>PDF Result Template</title>
        </head>
        <body>
            <h1>CASOS DE COVID-19</h1>
            <h2>Ciudad de ${city}</h2>
            <br><br><br>`;
  return head;
}

function getFooter(city, count) {
  const end = `<br><br><br>
            <h3>El total de casos en la ciudad de ${city} es: ${count} </h3>
            <div id="pageFooter" style="border-top: 1px solid #ddd; padding-top: 5px;">
                <p style="color: #666; width: 70%; margin: 0; padding-bottom: 5px; text-align: let; font-family: sans-serif; font-size: .65em; float: left;"><a target="_blank">david.espinosa@uptc.edu.co</a></p>
                <p style="color: #666; width: 70%; margin: 0; padding-bottom: 5px; text-align: let; font-family: sans-serif; font-size: .65em; float: left;">${new Date()}</p>
                <p style="color: #666; margin: 0; padding-bottom: 5px; text-align: right; font-family: sans-serif; font-size: .65em">Página {{page}} de {{pages}}</p>
            </div>
        </body>
    </html>`;
  return end;
}
