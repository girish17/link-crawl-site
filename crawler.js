var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "https://medium.com";
var MAX_PAGES_TO_VISIT = 100;
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

        crawl();
    } else {

            visitPage(nextPage, crawl);
        
    }
}

function visitPage(url, callback) {

    pagesVisited[url] = true;
    numPagesVisited++;

    console.log("Visiting page " + url);
    request(url, function (error, response, body) {
   
        console.log("Status code: " + response.statusCode);
        if (response.statusCode !== 200) {
            callback();
            return;
        }
        else {
   
            var $ = cheerio.load(body);
            collectInternalLinks($);
 
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
