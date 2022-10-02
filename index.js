const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const prompt = require('prompt')
const fs = require('fs')
const path = require('path')
const client = require('https')
const download = require('image-downloader')
const { resolve } = require('path')

puppeteer.use(StealthPlugin());

const colors = {
    style: {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m"
    },
    foreground: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m"
    },
    background: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m"
    },
}

const strWrap = (
    string,
    foreground = colors.foreground.white,
    background = colors.background.black,
    style = colors.style.reset
) => console.log(`${style}${foreground}${background}${string}${colors.style.reset}`)

const downloadImage = (url, filepath, index) => {
    return download.image({
        url: url,
        dest: `${filepath}/${index}.png` 
    });
}

const getImage = async (url,imageName) => {
    
    const browser = await puppeteer.launch({
        headless: true,
        args: [`--window-size=1920,1080`],
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    })

    strWrap(
        "  Launching new page and navigating to Twitch...",
        colors.foreground.red
    )

    const page = await browser.newPage()
    await page.goto(url)

    strWrap(
        "  Waiting for page load...",
        colors.foreground.red
    )

    await page.waitForFunction("document.querySelector('[class=\"card-body\"')")

    const urls = await page.evaluate(() => new Promise(resolve => resolve(Array.from(document.querySelector('[class="card-body"]').getElementsByTagName('img')).map(element => element.src))))

    fs.mkdir(path.join(__dirname, `/images/${imageName}`), (err) => {});

    urls.map((url, index) => downloadImage(url,path.join(__dirname, `/images/${imageName}`), index))

    await page.close();
    await browser.close();
    resolve();
}

(async () => {
    prompt.message = "";
    prompt.delimiter = "";
    let continueDownload;
    do {
        let response = await prompt.get({
            properties: {
                url: {
                    description: `\n\n  ${colors.background.black + colors.foreground.red
                        }Enter Link To Twitch emote DM:${colors.style.reset}`
                }
            }
        });
    
        const url = response.url.replace(/\s|\n/g, '')
        const imageName = url.split('/')[6]
    
        console.clear()
    
        await getImage(url,imageName)
    
        continueDownload = await prompt.get({
            properties: {
                response: {
                    description: `\n\n  ${colors.background.black + colors.foreground.red
                        }Download another image? (Y/N):${colors.style.reset}`
                }
            }
        });
        continueDownload = continueDownload.response.replace(/\s|\n/g, '')
    } while (/y/i.test(continueDownload))
})()