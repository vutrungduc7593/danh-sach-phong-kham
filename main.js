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
    let data = "Tên cơ sở;Số giấy phép;Địa chỉ;Ngày cấp;Tình trạng\n";
    let $nextPage = undefined;

    while (true) {
        // Parse Data
        const pageData = await page.$$eval('#dnn_ctr422_TimKiemGPHD_grvGPHN tbody tr', $stores => {
            let scrapedData = "";
    
            // We're getting the title, rank and URL of each post on Hacker News.
            $stores.forEach($store => {
                $td = $store.querySelector('td');
    
                if (!$td) return;
    
                scrapedData += `${$store.querySelector('td:nth-child(2)').innerText};${$store.querySelector('td:nth-child(3)').innerText};${$store.querySelector('td:nth-child(4)').innerText};${$store.querySelector('td:nth-child(5)').innerText};${$store.querySelector('td:nth-child(6)').innerText}\n`
            });
    
            return scrapedData;
        });

        data += pageData;

        // Go to next page
        const currentPageId = await page.$eval("a.aspNetDisabled", e => e.id);

        let nextPageId = undefined;

        switch (currentPageId) {
            case "dnn_ctr422_TimKiemGPHD_rptPager_lnkPage_0":
                nextPageId = "#dnn_ctr422_TimKiemGPHD_rptPager_lnkPage_2";
                break;

            case "dnn_ctr422_TimKiemGPHD_rptPager_lnkPage_11":
                // End of page, ignore
                break;
            
            // Special cases
            case undefined:
                break;
            case null:
                break;

            default:
                nextPageId = "#dnn_ctr422_TimKiemGPHD_rptPager_lnkPage_" + (Number(currentPageId.split("_").pop()) + 1);
                break;
        }

        $nextPage = await page.$(nextPageId);

        if (!$nextPage) break;

        await $nextPage.click();

        await page.waitForNavigation();
    }
    
    console.log('Saving output...');
    // console.log(data);
    const currentTime = Date.now();

    await fs.writeFileSync(`danh-sach-phong-kham_${currentTime}.csv`, data, {
        encoding: 'utf-8'
    });

    console.log('Closing Puppeteer...');
    await browser.close();

    console.log('Done.');
});
