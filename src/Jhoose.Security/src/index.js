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

  console.log(`Loading json`);
  var jsonData = fs.readFileSync(path.join(__dirname + '/testdata.json'));
  var policiesJson = JSON.parse(jsonData);

  console.log(`Inserting data into collection ${collectionName}`);
  policiesCol.insert(policiesJson);

  console.log(`Bootstrap commplete, added ${policiesCol.count()}`);
}