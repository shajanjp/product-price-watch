const crypto = require('crypto');
const got = require('got');
const CronJob = require('cron').CronJob;

let watchData = require('./data.json');
let watechedPrices = {};

function md5(text){
  let shasum = crypto.createHash('sha1');
  shasum.update(text);
  return shasum.digest('hex');
}

function parsePrice(body){
  let parsed = body.match(new RegExp('Price:</b>&nbsp;Rs. ' + "(.*)" + '&nbsp;'))[0];
  return parseInt(parsed.replace('Price:</b>&nbsp;Rs. ', '').replace('&nbsp;', '').replace(',', '').trim())
}

function parseTitle(body){
  let parsed = body.match(new RegExp('<b id="product-title">' + "(.*)" + '</b>'))[0];
  return parsed.replace('<b id="product-title">', '').replace('</b>', '').trim();
}

function checkPrices(){
  watchData.forEach(product => {
    got(product.url, {
      headers: {
        "User-Agent": "Nokia6600/1.0 (5.53.0) SymbianOS/7.0s Series60/2.0 Profile/MIDP-2.0 Configuration/CLDC-1.0"
      }
    })
    .then(data => {
      let productPrice = parsePrice(data.body);
      if(productPrice < product.price.lessThan && watechedPrices[md5(product.title)] !== productPrice){
        // Get cash ready
        let notificationTitle = `${product.title} Price Drop`
        let notificationDescription = `Its up for sale for Rs ${productPrice}/-`
        got(`https://maker.ifttt.com/trigger/PC/with/key/KEY_HERE?value1=${notificationTitle}&value2=${notificationDescription}`)
        console.log(`Trigger for ${product.title}`);
      }
    })
    .catch(error => {
      console.log('error', error);
    })
  })
}

watchData.forEach((product) => {
  watechedPrices[md5(product.title)] = 0;
});

new CronJob('*/10 * * * * *', function() {
  console.log('checking ', new Date);
  checkPrices();
}, null, true, 'Asia/Kolkata');
