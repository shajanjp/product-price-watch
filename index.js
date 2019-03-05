const got = require('got');
const CronJob = require('cron').CronJob;

let watchData = require('./data.js');

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
      if(productPrice < product.price.lessThan){
        // Get cash ready
        console.log(`Trigger for ${product.title} is now ${productPrice}`);
      }
    })
    .catch(error => {
      console.log('error', error);
    })
  })
}

new CronJob('* */5 * * * *', function() {
  console.log('checking ', new Date);
  checkPrices();
}, null, true, 'Asia/Kolkata');
