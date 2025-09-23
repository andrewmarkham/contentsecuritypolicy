const express = require('express');
const path = require('path');
//import { buildDasboardData } from './dashboardHelper';
const loki = require('lokijs');
const fs = require('fs');
var bodyParser = require('body-parser');
const { error } = require('console');


const { faker } = require('@faker-js/faker');
const { validate } = require('uuid');

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

app.get('/api/jhoose/csp', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  var policiesCol = db.getCollection(collectionName);
  var policies = policiesCol.data;

  await snooze(1500);
  res.json(policies);
})

app.get('/api/jhoose/settings', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  var settings = {
      mode: "off", 
      reportingMode: 1,
      reportingUrl: "http://www.bbc.co.uk/",
      reportToUrl: "http://www.bbc.co.uk/",
      webhookUrls: ["http://www.1", "http://www.2"],
      authenticationKeys: [
        { name: "key1 abc", key: "value1", revoked: false },
        { name: "key1", key: "value1 asdasjkhdas", revoked: true }
      ]
    }

  await snooze(1500);
  res.json(settings);
})
var jsonParser = bodyParser.json()
app.post('/api/jhoose/dashboard/search', jsonParser,async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  var r = {
    total: 2,
    results: [
      {
        id: "1",
        age: 0,
        recievedAt: "2024-07-16T21:55:08.405438Z",
        type: "csp-violation",
        url: "https://localhost:8001/",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
        browser: "Safari",
        version: "17.4",
        os: "Mac OS X",
        directive: "script-src-elem",
        blockedUri: "https://localhost:8001/assets/js/breakpoints.min.js",
        body: {
          documentURL: "https://localhost:8001/",
          disposition: "enforce",
          referrer: "",
          effectiveDirective: "script-src-elem",
          blockedURL: "https://localhost:8001/assets/js/breakpoints.min.js",
          originalPolicy: "default-src 'self' ; script-src 'none'; ; style-src 'self' 'nonce-be287871-9517-455b-a6bd-725218ebab3d' https: ; img-src * https: data: mediastream: blob: ; object-src * 'self' ; child-src * 'self' ;  report-uri https://localhost:8001/api/reporting/;  report-to csp-endpoint; ",
          statusCode: 200,
          sample: "",
          sourceFile: "https://localhost:8001/",
          lineNumber: 0,
          columnNumber: 1
        }
      },
      {
        id: "2",
        age: 0,
        recievedAt: "2024-07-16T21:55:08.405492Z",
        type: "csp-violation",
        url: "https://localhost:8001/",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
        browser: "Safari",
        version: "17.4",
        os: "Mac OS X",
        directive: "font-src",
        blockedUri: "https://fonts.gstatic.com:443/s/raleway/v34/1Ptug8zYS_SKggPNyCIIT4ttDfCmxA.woff2",
        body: {
          documentURL: "https://localhost:8001/",
          disposition: "enforce",
          referrer: "",
          effectiveDirective: "font-src",
          blockedURL: "https://fonts.gstatic.com:443/s/raleway/v34/1Ptug8zYS_SKggPNyCIIT4ttDfCmxA.woff2",
          originalPolicy: "default-src 'self' ; script-src 'none'; ; style-src 'self' 'nonce-be287871-9517-455b-a6bd-725218ebab3d' https: ; img-src * https: data: mediastream: blob: ; object-src * 'self' ; child-src * 'self' ;  report-uri https://localhost:8001/api/reporting/;  report-to csp-endpoint; ",
          statusCode: 200,
          sample: "",
          sourceFile: "https://localhost:8001/",
          lineNumber: 0,
          columnNumber: 1
        }
      }
    ],
    directives: ['font-src','script-src-elem'],
    browsers: ['Safari', 'Firefox']
  };

  await snooze(1500);
  res.json(r);
});

app.get('/api/jhoose/responseheaders', async (req, res) => {
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


app.post('/api/jhoose/csp',jsonParser, async (req, res) => {
  
  var policiesCol = db.getCollection(collectionName);
  var data = req.body;

  policiesCol.update(data);
  
  res.setHeader('Content-Type', 'application/json');

  await snooze(1500);
  res.json(data);
})

app.post('/api/jhoose/settings',jsonParser, async (req, res) => {
  
  var data = req.body;
  console.log(data);
  
  res.setHeader('Content-Type', 'application/json');

  await snooze(1500);
  res.json(data);
})

app.post('/api/jhoose/responseheaders',jsonParser, async (req, res) => {
  
  var data = req.body;
  console.log(data);
  
  var headerCol = db.getCollection("headers");
  var data = req.body;

  headerCol.update(data);

  res.setHeader('Content-Type', 'application/json');

  await snooze(1500);
  res.json(data);
})

app.post('/api/jhoose/dashboard', jsonParser, async (req, res) => {

  var query = req.body;
  console.log(query);

  res.setHeader('Content-Type', 'application/json');

  await snooze(1500);

  var summaryData = buildDasboardData(query);

  res.json(summaryData);
});

app.post('/api/jhoose/settings/export', jsonParser, async (req, res) => {

  var query = req.body;
  console.log(query);

  res.setHeader('Content-Type', 'application/json');

  await snooze(1500);

  var summaryData = buildDasboardData(query);

   res.json(summaryData);
});

app.post('/api/jhoose/settings/uploadimport', async (req, res) => {

  var data = req.body;
  console.log(data);

  res.setHeader('Content-Type', 'application/json');

  await snooze(1500);

  // Just return what was sent for now
  res.json(data);
});

app.get('/api/jhoose/settings/listimports', async (req, res) => {

  res.setHeader('Content-Type', 'application/json');

  await snooze(1500);

  var jsonData = fs.readFileSync(path.join(__dirname + '/csp-importdata.json'));
  var importdata = JSON.parse(jsonData);

  res.json(importdata);
});

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




const headings = [
    {'30m': '30 minutes'},
    {'1hr': '1 hour'},
    {'6hr': '6 hours'},
    {'12hr': '12 hours'},
    {'1d': '1 day'},
    {'3d': '3 days'},
    {'7d': '7 days'},
];

function buildDasboardData(query) {
    
    var {timeframe,type} = query;

    var summaryData = {
        query:{
          title: headings[timeframe],
          from: "2021-06-01T00:00:00Z",
          to: "2021-06-01T00:30:00Z"
        },
        total: faker.number.int({ max: 1000 }),
        topPages: buildPages(),
        topDirectives: buildDirectives(),
        errors: buildErrors(timeframe, type) 
    }

    return summaryData;
}

function buildErrors(timeFrame, type) {
    var errors = [];

    var directiveTypes = ["script-src", "connect-src", "default-src", "media-src", "child-src"];
    var browserTypes = ["Chrome", "Firefox", "Safari", "Edge", "IE"];

    var stepSize = 1;
    var steps = 30;
    switch (timeFrame) {
      case "30m":
        break;  
      case "1h": 
        stepSize = 2;
        steps = 60;
        break;
      case "6h":
        stepSize = 12;
        steps = 3600;
        break;
      case "12h":
        stepSize = 24;
        steps = 7200;
        break;  
      case "1d":  
        stepSize = 48;
        steps = 14400;
        break;  
      case "3d":
        stepSize = 48 * 3;
        steps = 14400 * 3;
        break;
      case "7d":  
        stepSize = 48 * 7;
        steps = 14400 * 7;
        break;
    }

    console.log(timeFrame);
    console.log(stepSize);
    console.log(steps);

    if (type === "browser") {

      for (bt in browserTypes) {
        for (let i = 0; i < steps; i = i+stepSize) {
          //console.log(i);
          errors.push({
              time: new Date(Date.now() + i*60000),
              value: faker.number.int({ max: 100 *  stepSize}),
              metric: browserTypes[bt]
          });
        }
      }
    } else if (type === "directive") {

      for (dt in directiveTypes) {
        for (let i = 0; i < steps; i = i+stepSize) {
          errors.push({
              time: new Date(Date.now() + i*60000),
              value: faker.number.int({ max: 100 *  stepSize}),
              metric: directiveTypes[dt]
          });
        }
      }
    }

    return errors;
}


function buildPages() {
    var pages = [];
    for (let i = 0; i < 5; i++) {
        var url = faker.internet.url();
        pages.push({
            name: url ,
            url: url,
            count: faker.number.int({ max: 1000 })
        });
    }
    return pages;
}

function buildDirectives() {
    var pages = [];

    pages.push({
        name: 'default-src' ,
        url: '#',
        count: faker.number.int({ max: 1000 })
    });

    pages.push({
        name: 'media-src' ,
        url: '#',
        count: faker.number.int({ max: 1000 })
    });

    pages.push({
        name: 'connect-src' ,
        url: '#',
        count: faker.number.int({ max: 1000 })
    });

    pages.push({
        name: 'child-src' ,
        url: '#',
        count: faker.number.int({ max: 1000 })
    });

    pages.push({
        name: 'script-src' ,
        url: '#',
        count: faker.number.int({ max: 1000 })
    });

    return pages;
}