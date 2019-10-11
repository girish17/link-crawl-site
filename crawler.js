'use strict';

const request = require('request');
const cheerio = require('cheerio');
const mysql   = require('mysql');
const URL     = require('url-parse');
var dotenv    = require('dotenv');

var START_URL = "https://medium.com";
var MAX_PAGES_TO_VISIT = 100;
var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

dotenv.config();

var conn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD
});

class Reference {

    constructor (link, params) {
        this.link = link;
        this.params = params;
    }

    getLink () {
        return this.link;
    }

    getParams () {
        return this.params;
    }

}

var ReferenceArray = new Array();

/*conn.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    conn.query("CREATE DATABASE crawler", function (err, result) {
      if (err) throw err;
      console.log("Database created");
    });
    let sql =  "CREATE TABLE references (link VARCHAR, count INT, params VARCHAR)";
    conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created: references");
    })
});*/

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
        let params = new URLSearchParams(toVisitURL.query);
        let ref = new Reference(toVisitURL.pathname, Array.from(params.keys()).toString());
        console.log("Object to be saved: ", ref);
        ReferenceArray.push(ref);
        pagesToVisit.push(toVisitURL);
    });
}

//TODO
function insertRelativeLinks(RelLink)
{

}