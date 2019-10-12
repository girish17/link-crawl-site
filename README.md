# link-crawl-site

### About

This node.js project recursively crawls a website and harvests all possible hyperlinks that belong to it and stores them in an in-memory database (Redis). The max number of pages visited is set to 10 by default (see [crawler](crawler.js)). This can be changed to a bigger number depending on the quantum of data to be harvested. Also, the website to be visited initially can be changed here.

### Prerequisite installations

- [Redis](https://redis.io/download)
- [Docker](https://docs.docker.com/install)

### Environment settings

- Create a `.env` file with following details:
  - `REDIS_HOST=<host name>` (like localhost)
  - `REDIS_PASSWORD=<if any>` (can be changed in redis.conf file after installation)

### Run docker image
`docker run girish17/link-crawl-site`<br>
The docker image is also available [here](https://hub.docker.com/r/girish17/link-crawl-site)

### Understanding the output format

The stored hyperlinks in the Redis store are retrieved and printed on console in the following format:<br>
`<list of relative hyperlinks> - <respective count of each hyperlink> - <list of params in relative links>`
##### Note: The last log is a consolidated output of all the results.
