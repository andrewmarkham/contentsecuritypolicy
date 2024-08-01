const faker = require('faker');
const fs = require('fs');

const headings = [
    {'30m': '30 minutes'},
    {'1hr': '1 hour'},
    {'6hr': '6 hours'},
    {'12hr': '12 hours'},
    {'1d': '1 day'},
    {'3d': '3 days'},
    {'7d': '7 days'},
];

export function buildDasboardData(query) {
    
    var {timeFrame,type} = query;

    var jsonData = fs.readFileSync(path.join(__dirname + '/dashboard-summary.json'));
    var data = JSON.parse(jsonData);

    var summaryData = {
        query:{
          title: headings[timeFrame],
          from: "2021-06-01T00:00:00Z",
          to: "2021-06-01T00:30:00Z"
        },
        total: 65,
        topPages: buildPages(),
        topDirectives: buildDirectives(),
        errors: data 
    }

    return summaryData;
}

function buildPages() {
    var pages = [];
    for (let i = 0; i < 5; i++) {
        var url = faker.internet.url();
        pages.push({
            name: url ,
            url: url,
            count: faker.random.number()
        });
    }
    return pages;
}

function buildDirectives() {
    var pages = [];

    pages.push({
        name: 'default-src' ,
        url: '#',
        count: faker.random.number()
    });

    pages.push({
        name: 'media-src' ,
        url: '#',
        count: faker.random.number()
    });

    pages.push({
        name: 'connect-src' ,
        url: '#',
        count: faker.random.number()
    });

    pages.push({
        name: 'child-src' ,
        url: '#',
        count: faker.random.number()
    });

    pages.push({
        name: 'script-src' ,
        url: '#',
        count: faker.random.number()
    });

    return pages;
}