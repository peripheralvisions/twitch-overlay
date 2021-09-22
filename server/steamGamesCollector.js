const puppeteer = require('puppeteer');
const fs = require('fs');

const steamSelectors = {
    rowSelector: '.search_result_row',
    text: {
        title: '.title',
        releaseDate: '.search_released',
        reviews: '.search_review_summary',
    }
}

const steamRoutes = {
    newAndTrending: {
        // WITHOUT CATEGORIES - Shows unnecessary data such as software and videos
        // popularNewReleases: "https://store.steampowered.com/search/?filter=popularnew&sort_by=Released_DESC&os=win",
        // newReleases: "https://store.steampowered.com/search/?sort_by=Released_DESC&os=win"
        popularNewReleases: {
            url: "https://store.steampowered.com/search/?sort_by=Released_DESC&category1=998%2C21%2C10%2C997&os=win&filter=popularnew",
            maxAmount: 150,
        },
        newReleases: {
            url: "https://store.steampowered.com/search/?sort_by=Released_DESC&category1=998%2C21%2C10%2C997&os=win",
            maxAmount: 600,
        }
    }
}

async function autoScroll(page, maxGamesFetched) {
    await page.evaluate(async(steamSelectors, maxGamesFetched) => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            let totalElements = 0;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;

                window.scrollBy(0, distance);

                totalHeight += distance;
                totalElements = document.querySelectorAll(steamSelectors.rowSelector).length;

                if (totalElements >= maxGamesFetched) {
                    clearInterval(timer);
                    resolve();
                }

            }, 100);
        });
    }, steamSelectors, maxGamesFetched);
}

//Array of objects
async function scrapeSteamRoute(pathToSaveFile = 'server/steamData.json') {
    const result = {};

    const browser = await puppeteer.launch({headless: false, 
        args: ['--lang=en-US']
    });
    
    const page = await browser.newPage();

    await page.setGeolocation({latitude: 40.730610, longitude: -73.935242});

    //LOOP HERE routes.forEach(async (routesObj) => {
    for (category in steamRoutes) {

        result[category] = {}; //Initialize category to prevent accesing undefined property;

        for (route in steamRoutes[category]) {
            
            const currentURL = steamRoutes[category][route].url;

            console.log('Requesting', currentURL);

            await page.goto(currentURL, {waitUntil: 'networkidle2'});

            const max = steamRoutes[category][route].maxAmount;

            console.log('Fetching ', max, " games")
            
            await autoScroll(page, max); //Select all games and parse

            const steamData = await page.$$eval('.search_result_row', (steamData, args) => {
                //Executes - WITHIN BROWSER
                const steamSelectors = args[0];
                const route = args[1];

                console.log(args)

                return steamData.map(domNode => {

                    //Resulting object
                    const result = {};

                    //Mouse over eventd 
                    const mouseoverEvent = new Event('mouseover');
                    domNode.dispatchEvent(mouseoverEvent);

                    //App ID
                    const appId = domNode
                        .getAttribute('data-ds-appid')
                        .split(",")[0]
                    result['appId'] = appId;

                    //Header
                    const imageCDN = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}`;
                    const images = {
                        imageCDN,
                        routes: {
                            coverSmall: "/capsule_sm_120.jpg",
                            header: "/header.jpg"
                        }
                    };
                    result['images'] = images;

                    //Price
                    let price = domNode.querySelector('.search_price').innerText;

                    if (price) {
                        price = price.split(/\n/);
                        console.log(price);

                        if (price.length === 2) {
                            result['price'] = {
                                originalPrice: price[1],
                                currentPrice: price[0]
                            }
                        } else {
                            result['price'] = {
                                originalPrice: null,
                                currentPrice: price[0],
                            }
                        }
                    } else {
                        result['price'] = {
                            originalPrice: null,
                            currentPrice: null,
                        }
                    }

                    // Select queries from steamSelectors within current dom node and append values
                    // to result object
                    for (key in steamSelectors) {
                        const selector = steamSelectors[key];
                        const dom = domNode.querySelector(selector);
                        const value = dom
                            ? dom.innerText
                            : "No data";
                        result[key] = value;
                    }

                    console.log(route);
                    result['route'] = route;

                    return result; //An object with all selected games
                });
            }, [steamSelectors.text, route]); //END OF BROWSER SCRIPT

            for (steamDataEach of steamData) {
                const hoverId = '#hover_app_' + steamDataEach.appId;

                console.log('Dealing with ', hoverId);

                let elExists = null;

                try {
                    elExists = await page.waitForSelector(hoverId, {timeout: 5000});
                } catch {
                    console.log('element doesnt exist, moving on')
                }

                if (!elExists) {
                    steamDataEach.screenshots = [];
                    continue;
                }

                const hoverMenu = await page.$eval(hoverId, (el) => {

                    //Screenshots
                    const screenshotsDom = Array.from(el.querySelectorAll('.screenshot'));
                    const screenshots = screenshotsDom.map(node => {
                        let str = node.style.backgroundImage;
                        str = str.slice(5);
                        str = str.substring(0, str.length - 2);
                        return str;
                    });


                    const summary = el.querySelector('.game_review_summary') && el.querySelector('.game_review_summary').innerText || null;
                    let amountValue = el.querySelector('.hover_review_summary') && el.querySelector('.hover_review_summary').childNodes[4].nodeValue.trim() || null;

                    if (amountValue) {
                        amountValue = amountValue.split(" ")[0];
                        amountValue = amountValue.slice(1);
                    }

                    //Reviews
                    const reviews = {
                        summary,
                        total: amountValue,
                    }

                    //Tags
                    const domTags = Array.from(el.querySelectorAll('.app_tag'));
                    const tags = domTags.length >= 1 ? domTags.map(each => each.textContent) : null;

                    //Final object
                    return {
                        screenshots, 
                        tags, 
                        reviews
                    };
                });

                for(key in hoverMenu) {
                    steamDataEach[key] = hoverMenu[key];
                }

                // steamDataEach.additional = {
                //     ...hoverMenu
                // };
                
            }
            result[category][route] = steamData;
            console.log('Written CATEGORY:', category, 'ROUTE:', route, "TOTAL:", result[category][route].length)
        }
    }
 
    console.log(pathToSaveFile);
    await fs.writeFileSync(pathToSaveFile, JSON.stringify(result));
    // await browser.close();
    console.log('Finished writing steamData');
    return result;
}

scrapeSteamRoute()