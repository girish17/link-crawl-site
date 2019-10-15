'use strict';

const request = require('request');
const cheerio = require('cheerio');
const URL     = require('url-parse');
const dotenv  = require('dotenv');
const redis   = require('redis');

dotenv.config();

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(process.env.START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
var linkCountMap = new Map();

var client = redis.createClient({
    port: 6379,
    host: process.env.REDIS_HOST
})

class Reference {

    constructor (link, count, params) {
        this.link = link;
        this.count = count;
        this.params = params;
    }

    getCount() {
        return this.count;
    }

    getLink () {
        return this.link;
    }

    getParams () {
        return this.params;
    }

}

var ReferenceArray = new Array();

pagesToVisit.push(process.env.START_URL);
crawl();

function crawl() {
    if (numPagesVisited >= process.env.MAX_PAGES_TO_VISIT) {
        console.log("Reached max limit of number of pages to visit.");
        printLinks();
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
    request({url}, function (error, response, body) {
        console.log("Error: ", error);
        if(response)
        {
            console.log("Status code: " + response.statusCode);
            if (response && response.statusCode !== 200) {
                callback();
                return;
            }
            else {
       
                var $ = cheerio.load(body);
                collectInternalLinks($);
     
                callback();
            }
        }
        else
        {
            if(body)
            {
                var $ = cheerio.load(body);
                collectInternalLinks($);
                callback();
            }
        }
    });
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function () {
        var link = $(this).attr('href');
        console.log("baseURL: ", baseUrl);
        console.log("relative link: ", link);
        let toVisitURL = new URL(link, baseUrl);

        if(linkCountMap.get(link))
        {
            linkCountMap.set(link, linkCountMap.get(link)+1);
        }
        else
        {
            linkCountMap.set(link, 1);
        }

        let params = new URLSearchParams(toVisitURL.query);
        linkCountMap.forEach((count, link) => {
            let ref = new Reference(link, count, Array.from(params.keys()).toString());
            ReferenceArray.push(ref);
        })
        pagesToVisit.push(toVisitURL);
    });
    insertRelativeLinks();
}

function insertRelativeLinks()
{
    ReferenceArray.forEach(element => {
        //console.log("Object to be saved in redis: ", element);
        client.lpush("refList", JSON.stringify(element), function(err) {
            if(err) {
                throw err;
            }
        });
    });
}

function printLinks()
{
    console.log("\n***Relative Links-----------Count--------------Params***");
    ReferenceArray.forEach(element => {
        client.lpop("refList", function(err,value) {
            let refVal = JSON.parse(value);
            if (err) {
              throw err;
            } else {
                console.log("\n"+refVal.link+"-----------"+refVal.count+"--------------"+refVal.params);
            }
        });
    });
}
