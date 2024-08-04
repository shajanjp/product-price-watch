const crypto = require('crypto');
const axios = require('axios');
const CronJob = require('cron').CronJob;

let watchList = require('./data.json');
let watechedPrices = {};

function md5(text){
  let shasum = crypto.createHash('sha1');
  shasum.update(text);
  return shasum.digest('hex');
}

async function checkPrices(){
  for(const product of watchList) {
    const currentPrice = await getCurrentPrice(product.url);
    console.log(`Current price for ${product.title}: ${currentPrice}`);

    if(currentPrice < product.price.lessThan && watechedPrices[md5(product.title)] !== currentPrice){
      let notificationTitle = `${product.title} Price Drop`;
      let notificationDescription = `Its up for sale for Rs ${productPrice}/-`;

      console.log(notificationTitle);
      console.log(notificationDescription);
    }
  }
}


for(const product of watchList){
  watechedPrices[md5(product.title)] = Infinity;
}

checkPrices();

new CronJob('*/60 * * * * *', function() {
  console.log('checking ', new Date);
  checkPrices();
}, null, true, 'Asia/Kolkata');


async function getCurrentPrice(url){
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url,
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0', 
      'Accept': '*/*', 
      'Accept-Language': 'en-US,en;q=0.5', 
      'Accept-Encoding': 'gzip, deflate, br, zstd', 
      'Referer': 'https://pricehistoryapp.com/', 
      'x-nextjs-data': '1', 
      'Connection': 'keep-alive', 
      'Cookie': '_ga_0NZKRZWG40=GS1.1.1722746618.9.0.1722746618.0.0.0; _ga=GA1.2.1831820402.1719164588; __gads=ID=9e8ee35d756526fc:T=1719164590:RT=1722746619:S=ALNI_MaQ-JltpXiWzJR43acdIsPyzkAhqw; __gpi=UID=00000e5fd90f846d:T=1719164590:RT=1722746619:S=ALNI_MZmuYcwLP4SnF5evV0pBKaIQwO5PQ; __eoi=ID=ac20dd21f00a4b94:T=1719164590:RT=1722746619:S=AA-AfjY7cZWsG1koKBD_qF47SWBl; _gid=GA1.2.1428264257.1722746618; _gat_gtag_UA_50001635_52=1; FCNEC=%5B%5B%22AKsRol_TglUKkz9RFapBhBxohagKq62Sv3LXbyeCvjzMWOprXo2_iLPkleO-l4kmWm_1uIbCFd86BbnvM2FoiH13AYMGGie1bYuByWsk1txGauQYIUBfbel-GgYuBP8PFTiZefTzYZrjuOIhUAP3L-m_MVaP3R_tLg%3D%3D%22%5D%5D', 
      'Sec-Fetch-Dest': 'empty', 
      'Sec-Fetch-Mode': 'cors', 
      'Sec-Fetch-Site': 'same-origin', 
      'Priority': 'u=4', 
      'TE': 'trailers'
    }
  };
  
  return axios.request(config)
  .then((response) => {
    return (response?.data?.pageProps?.ogProduct?.price || Infinity);
  })
  .catch((error) => {
    return Infinity
  });
}

