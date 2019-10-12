# link-crawl-site

### About

This node.js project recursively crawls a website and harvests all possible hyperlinks that belong to it and stores them in an in-memory database (Redis).

### Prerequisite installations

- [Redis](https://redis.io/download)
- [Docker](https://docs.docker.com/install)

### Run docker image
`docker run girish17/link-crawl-site`<br>
The docker image is also available [here](https://hub.docker.com/r/girish17/link-crawl-site)

### Understanding the output format

The stored hyperlinks in the Redis store are retrieved and printed on console in the following format:<br>
`<list of relative hyperlinks> - <respective count of each hyperlink> - <list of params in relative links>`
The last log is a consolidated output of all the results.
