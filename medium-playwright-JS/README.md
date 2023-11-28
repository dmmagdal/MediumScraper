# Magnifier Playwright JS

Description: A simple script that works to download and catalog medium articles for offline use.


### Requirements/Todos

[ ] All images are saved as either png or svg

[ ] Save (embedded) videos locally in AV1 compressed format <- AV1 is not a compression format, but an encoding! Investigate possible (lossless compressed) video formats

[ ] Articles can be restored to a "Medium"-esque style (with a default CSS)

[ ] Dockerize

[ ] Map all article urls to their local folder hashes (and vice versa) in a JSON file (keep updated as well)

[ ] Constantly check for updates to list

[ ] Pull text data for later analysis/projects/organization -> this can be done from the HTML saved

[ ] Run scraper continuously (only operates when it detects new urls) and mark urls that are gone

[ ] Modify local copies of the HTML to source media (images and videos) from local copies when no internet is detected

[ ] Better organize code/refactor for typescript


### Notes

 - According to Google Chrome, the test Medium article ([Scraping Web Apps using Direct HTTP Request](https://medium.com/analytics-vidhya/scraping-web-apps-using-direct-http-request-f5c02a2874fe)) took about 150MB of memory in the browser while the local folder uses around 3MB of storage.
 - At this time (Nov 2023), scraping all links (106 total) listed in `links.txt`, the data storage useage is 261MB on disk (around 2.46MB per link on average).
     - NOTE: video saving has not been implemented yet. This will likely grow once that is integrated.


### References

 - [ScrapingBee](https://www.scrapingbee.com/blog/playwright-web-scraping/): "Scraping the web with Playwright"
 - [ScrapingAnt](https://scrapingant.com/blog/playwright-download-file): "How to download a file with Playwright"
 - [Medium article](https://medium.com/@animeshsingh161/downloading-images-with-playwright-headless-browser-using-multithreading-python-b22d54311eda): "Downloading Images with playwright headless browser using Multithreading | Python"
 - cli-progress [npm module](https://www.npmjs.com/package/cli-progress)
 - cheerio [npm module](https://www.npmjs.com/package/cheerio)
 - playwright [npm module](https://www.npmjs.com/package/playwright)
 - playwright [documentation](https://playwright.dev/docs/intro)