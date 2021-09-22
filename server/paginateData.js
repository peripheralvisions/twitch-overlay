
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./steamData.json'));

function paginateData(data, limit = 25) {
    //data must be equal to array of objects
    const pages = []; //Array of arrays filled with objects

    let currentPage = [];
    let currentGameIndex = 0;

    for (gameObject of data) {
        if (currentGameIndex === limit) {
            console.log('splitting data', currentGameIndex, limit)
            pages.push(currentPage);
            currentGameIndex = 0;
            currentPage = [];
        }
        currentPage.push(gameObject);
        currentGameIndex++;
    }

    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    return pages;
}


const paginatedData = {};

for (categoryKey in data) {
    paginatedData[categoryKey] = {};
    for(routeKey in data[categoryKey]) {
        paginatedData[categoryKey][routeKey] = paginateData(data[categoryKey][routeKey])
    }
}

fs.writeFileSync('paginatedData.json', JSON.stringify(paginatedData));


module.export = paginateData;