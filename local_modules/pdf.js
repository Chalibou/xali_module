/** 
 * Module for mail management
 * @module pdf
 */

const puppeteer = require('puppeteer');

class pdf{
    constructor(sourceApp){
        this.logger = sourceApp.logger;
        this.templater = sourceApp.templater;
        this.printOptions = {
            format: 'A4',
            margin: {
                top: "50px",
                bottom: "50px",
                right:"50px",
                left:"50px"
            },
            printBackground: true,
            path: `${process.cwd()}/test.pdf`
        }
    }
    
    buildPdf(template,data,lang){
        return new Promise(async(resolve,reject)=>{
            try{
                const htmlContent = await this.templater.fillTemplate(template,data,lang);
                const browser = await puppeteer.launch({
                    args: ['--no-sandbox'],
                    headless: true,
                    defaultViewport: null
                });
                const page = await browser.newPage();
                await page.setContent(htmlContent,{"waitUntil" : "networkidle0"});
                const pdfBinary = await page.pdf(this.printOptions);
                await browser.close();
                resolve(pdfBinary);
            }catch(err){
                reject(err);
            }
        })
    }
    
}
module.exports = pdf;