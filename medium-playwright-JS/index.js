// Import the necessary packages.
const playwright = require('playwright');
const cheerio = require('cheerio');
const cliProgress = require('cli-progress');
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');


// Use https to download an image given its url and save it to the 
// specified path.
async function downloadImage(imageURL, imagePath) {
    https.get(imageURL, (response) => {
        response.pipe(fs.createWriteStream(imagePath))
    })
}


// Create the folder structure for storing the data.
function createFolders(urlHash) {
    // Create the base folder.
    const basePath = path.join('savedArticles', urlHash)
    if (!fs.existsSync(basePath) || !fs.statSync(basePath).isDirectory()) {
        fs.mkdirSync(basePath, {recursive: true});
    }

    // Create the images folder.
    const imagesPath = path.join(basePath, 'images');
    if (!fs.existsSync(imagesPath) || !fs.statSync(imagesPath).isDirectory()) {
        fs.mkdirSync(imagesPath);
    }

    // Create the videos folder.
    const videosPath = path.join(basePath, 'videos');
    if (!fs.existsSync(videosPath) || !fs.statSync(videosPath).isDirectory()) {
        fs.mkdirSync(videosPath);
    }

    // Return the paths of the main folder and subfolders.
    return [basePath, imagesPath, videosPath];
}


// Hash a URL with the SHA256 algorithm.
function hashURL(url, encoding='hex') {
    // Create new hash object.
    const hash = crypto.createHash('sha256');

    // Update the hashed content (with the URL). Default encoding is 
    // utf-8 unless otherwise specified.
    hash.update(url);

    // Compute the actual (sha256) hash. If no encoding (ie hex, 
    // base64, base64url, binary) is provided, then a Buffer is 
    // returned (just use hex for now since Buffer.toString() will
    // probably return illegible characters). 
    const hashedString = hash.digest(encoding);

    // Return the hashed string.
    return hashedString;
}


async function scrapeArticle(page, url, saveOriginalHTML=true) {
    // Go to the article URL.
    await page.goto(url);

    // Isolate a component from the page.
    const section = await page.locator('section');
    const sectionHTML = await section.innerHTML();

    // Hash the article URL to create a set folder.
    const folderHash = hashURL(url);

    // Initialize the save folders for the the article.
    const [folderPath, imagesPath, videosPath] = createFolders(folderHash);

    // Extract all photos from the page and create a local save copy on disk.
    const images = await section.locator('img').all();
    for (let i = 0; i < images.length; i++) {
        const imgURL = await images[i].getAttribute('src');

        // TODO: Make sure all images can be saved in PNG format.
        const imgPath = path.join(imagesPath, `image_${i}.png`);    
        await downloadImage(imgURL, imgPath);
    }

    // File paths to write the HTML to a file.
    const filePath = path.join(folderPath, 'article.html');
    const filePathOriginalCopy = path.join(folderPath, 'article_original.html');
    
    // Save an original copy of the HTML code if specified.
    if (!fs.existsSync(filePathOriginalCopy) && saveOriginalHTML) {
        fs.writeFileSync(filePathOriginalCopy, sectionHTML);
    }

    // Modify each <img> tag to include the local image path as the 
    // 'alt' attribute. 
    const $ = cheerio.load(sectionHTML);
    $('img').each((index, element) => {
        const imgPath = path.join(imagesPath, `image_${index}.png`); 
        $(element).attr('alt', imgPath);
    });

    // Save the modified HTML.
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, $.html());
    }
}


async function main() {
    // Read in urls from links.txt
    const linksFile = './links.txt';
    const fileContent = fs.readFileSync(linksFile, 'utf-8');
    const addresses = fileContent.split('\n');

    // Remove any trailing newline from the last line.
    if (addresses.length > 0 && addresses[addresses.length - 1] === '') {
        addresses.pop();
    }

    // Initialize (chromium) browser instance.
    const browser = await playwright.chromium.launch({
        // headless: false,    // run with GUI or headless
        headless: true,
    });

    // Initialize new page in the browser and go to the target website.
    // const article = 'https://medium.com/analytics-vidhya/scraping-web-apps-using-direct-http-request-f5c02a2874fe';
    const page = await browser.newPage();

    // Initialize CLI progress bar.
    const scrapeBar = new cliProgress.SingleBar(
        {},
        cliProgress.Presets.shades_classic,
    );
    console.log(`Scraping articles from ${linksFile}`);
    scrapeBar.start(addresses.length, 0);
    
    // Iterate through each address, scraping it if has not already been processed.
    for (const address of addresses) {
        await scrapeArticle(page, address);
        scrapeBar.increment();
    }
    scrapeBar.stop();

    // Close the browser.
    await browser.close();
}


main();