var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "https://medium.com";
var MAX_PAGES_TO_VISIT = 100;
var MAX_REQUEST = 5;
var requests_made = 0;
var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
    if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
        console.log("Reached max limit of number of pages to visit.");
        return;
    }
    var nextPage = pagesToVisit.pop();
    if (nextPage in pagesVisited) {
        // We've already visited this page, so repeat the crawl
        requests_made = 0;
        crawl();
    } else {
        // New page we haven't visited
        /*if(requests_made < MAX_REQUEST)*/ {
            requests_made++;
            visitPage(nextPage, crawl);
        }
    }
}

function visitPage(url, callback) {
    // Add page to our set
    pagesVisited[url] = true;
    numPagesVisited++;

    // Make the request
    console.log("Visiting page " + url);
    request(url, function (error, response, body) {
        // Check status code (200 is HTTP OK)
        console.log("Status code: " + response.statusCode);
        if (response.statusCode !== 200) {
            callback();
            return;
        }
        else {
            // Parse the document body
            var $ = cheerio.load(body);
            collectInternalLinks($);
            // In this short program, our callback is just calling crawl()
            callback();
        }
    });
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function () {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });
}