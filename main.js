// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

// Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require('apify');
const fs = require('fs');

Apify.main(async () => {
    console.log('Launching Puppeteer...');
    const browser = await Apify.launchPuppeteer({
        // slowMo: 500, // for Debugging
    });

    console.log(`Opening page...`);
    const page = await browser.newPage();
    await page.goto('http://thongtin.medinet.org.vn/Gi%E1%BA%A5y-ph%C3%A9p-ho%E1%BA%A1t-%C4%91%E1%BB%99ng');

    console.log("Parsing Data...");
    // const LAST_PAGE = 752;
    let nextPage = 2;
    const LAST_PAGE = 3;
    let data = "Tên cơ sở,Số giấy phép,Địa chỉ,Ngày cấp,Tình trạng\n";

    do {
        // Parse Data
        const pageData = await page.$$eval('#dnn_ctr422_TimKiemGPHD_grvGPHN tbody tr', $stores => {
            let scrapedData = "";
    
            // We're getting the title, rank and URL of each post on Hacker News.
            $stores.forEach($store => {
                $td = $store.querySelector('td');
    
                if (!$td) return;
    
                scrapedData += `${$store.querySelector('td:nth-child(2)').innerText},${$store.querySelector('td:nth-child(3)').innerText},${$store.querySelector('td:nth-child(4)').innerText},${$store.querySelector('td:nth-child(5)').innerText},${$store.querySelector('td:nth-child(6)').innerText}\n`
            });
    
            return scrapedData;
        });

        data += pageData;

        // Go to next page
        $nextPage = await page.$("#dnn_ctr422_TimKiemGPHD_rptPager_lnkPage_" + nextPage++);

        await $nextPage.click();

        await page.waitForNavigation();
    } while (nextPage <= LAST_PAGE + 1);
    
    console.log('Saving output...');
    // console.log(data);
    await fs.writeFileSync("khong-kham.csv", data, {
        encoding: 'utf-8'
    });

    console.log('Closing Puppeteer...');
    await browser.close();

    console.log('Done.');
});
