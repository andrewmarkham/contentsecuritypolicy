const express = require('express');
const path = require('path');

const loki = require('lokijs');
const fs = require('fs');
var bodyParser = require('body-parser')

const app = express()
const port = 3000

var db = new loki(dbName);;
var dbName = "CSPDB";
var collectionName = "policies";

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

app.use('/dist', express.static(path.join(__dirname, '../dist/Jhoose.Security')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html' ));
})

app.get('/api/csp', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  var policiesCol = db.getCollection(collectionName);
  var policies = policiesCol.data;

  await snooze(1500);
  res.json(policies);
})

app.get('/api/csp/settings', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  var settings = {mode: "on", reportingUrl: "http://www.bbc.co.uk/"  }

  await snooze(1500);
  res.json(settings);
})

app.get('/api/csp/header', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  var headersCol = db.getCollection("headers");
  //var headers = headersCol.data;

  var resp = {
    useHeadersUI: true,
    headers: headersCol.data
  }

  await snooze(1500);
  res.json(resp);
})

var jsonParser = bodyParser.json()
app.post('/api/csp',jsonParser, async (req, res) => {
  
  var policiesCol = db.getCollection(collectionName);
  var data = req.body;

  policiesCol.update(data);
  
  res.setHeader('Content-Type', 'application/json');

  await snooze(1500);
  res.json(data);
})

app.post('/api/csp/settings',jsonParser, async (req, res) => {
  
  var data = req.body;
  console.log(data);
  
  res.setHeader('Content-Type', 'application/json');

  await snooze(1500);
  res.json(data);
})

app.post('/api/csp/header',jsonParser, async (req, res) => {
  
  var data = req.body;
  console.log(data);
  
  var headerCol = db.getCollection("headers");
  var data = req.body;

  headerCol.update(data);

  res.setHeader('Content-Type', 'application/json');

  await snooze(1500);
  res.json(data);
})

app.get('/EPiServer/Shell/epiplatformnavigation', async(req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname + '/menuItems.json' ));
});

app.listen(port, () => {

  bootstrapDB();
  console.log(`Example app listening at http://localhost:${port}`)
})

function bootstrapDB() {

  console.log(`Bootstrapping database ${dbName}`)

  var policiesCol = db.addCollection(collectionName, { indices: ['id'] });

  console.log(`Loading CSP json`);
  var jsonData = fs.readFileSync(path.join(__dirname + '/testdata.json'));
  var policiesJson = JSON.parse(jsonData);

  console.log(`Inserting CSP data into collection ${collectionName}`);
  policiesCol.insert(policiesJson);

  const data = [
    {
        "name": "Strict-Transport-Security",
        "maxAge": 31536000,
        "includeSubDomains": true,
        "id": "340c0df9-40ca-45a3-b1dd-c4c8552c0a77",
        "enabled": true
    },
    {
        "name": "X-Frame-Options",
        "mode": 0,
        "domain": null,
        "id": "f9a47203-c3e4-46e7-88c9-3cf5dd42d076",
        "enabled": true
    },
    {
        "name": "X-Content-Type-Options",
        "id": "8dd81349-3fe0-4a72-ade9-4d16c7a9db12",
        "enabled": true,
        "value": "nosniff"
    },
    {
        "name": "X-Permitted-Cross-Domain-Policies",
        "mode": 0,
        "id": "d6c22e24-3a15-4c8a-8a43-f7f918954c84",
        "enabled": true
    },
    {
        "name": "Referrer-Policy",
        "mode": 0,
        "id": "f3075d82-9767-4843-aae7-bda514938448",
        "enabled": true
    },
    {
        "name": "Cross-Origin-Embedder-Policy",
        "mode": 1,
        "id": "6c95dd4d-c2a9-44d4-91fc-eac525750893",
        "enabled": true
    },
    {
        "name": "Cross-Origin-Opener-Policy",
        "mode": 2,
        "id": "c869f90e-1bdd-4c9f-8a58-5ee80411b668",
        "enabled": true
    },
    {
        "name": "Cross-Origin-Resource-Policy",
        "mode": 1,
        "id": "6a257b41-baea-44fe-8253-47428fbe0d1b",
        "enabled": true
    }
];

  var headersCol = db.addCollection("headers", { indices: ['id'] });

  console.log(`Loading header json`);

  console.log(`Inserting header data into collection headers`);
  headersCol.insert(data);

  console.log(`Bootstrap commplete, added ${policiesCol.count()}, added ${headersCol.count()}`);
}