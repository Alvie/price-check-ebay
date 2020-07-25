const ebayNode = require('ebay-node-api');
const Discord = require('discord.js');

const credentials = require('./credentials');
const prefix = 'e!';

const boolSearchArr = ['pro', 'plus', 'max', 'super', 'bundle', 'combo', 'faulty', 'ti', 'xt', 'spare', 'spares', 'repair', 'repairs', 'cooler', 'pc', 'damaged', 'broken'];

const clamp = (num, clamp, higher) =>
	higher ? Math.min(Math.max(num, clamp), higher) : Math.min(num, clamp)

// extract and convert ebay's price object to a float value
function floatVal(priceObject) {
	return parseFloat(priceObject.__value__);
}

// ebay conn
const ebay = new ebayNode({
	clientID: credentials.clientId,
	countryCode: 'EBAY-GB',
	headers: {
		'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB' // For Great Britain https://www.ebay.co.uk
	}
});

// this function adds in the required boolean search
// operators for a better result
function removeWords(inputStr) {
	let newSearchArr = boolSearchArr;
	for(const word of boolSearchArr) {
		if(inputStr.includes(word)){
			newSearchArr = newSearchArr.filter(subStr => subStr !== word);
		}
	}
  return '-' + newSearchArr.join(' -'); // ['a', 'b'] -> '-a -b'
}

// search API
//   - UK only [DONE]
//   - condition used [DONE]
//   - filter spares / repairs / faulty [TODO - semi done]
//   - return prices (inc P&P) of last 5 sold [DONE]
//   - filter versions (pro, max, plus, ti, super, xt) [DONE]
async function getPriceArrayOfItem(query) {
	console.log('checking', query)
	newQuery = query + ' ' + removeWords(query.toLowerCase()); // filter versions (pro, max, plus, ti, super, xt)
	console.log('newQuery', newQuery);
	
	try {
		const data = await ebay.findCompletedItems({
			keywords: newQuery,
			sortOrder: 'EndTimeSoonest', //https://developer.ebay.com/devzone/finding/callref/extra/fndcmpltditms.rqst.srtordr.html
			Condition: 3000,
			SoldItemsOnly: true,
			entriesPerPage: 5
		});

		let priceArray = [];
		const items = data[0].searchResult[0].item;
		if (!items) {
			priceArray = [0];
		} else {
			for (item of items) {
				const basePrice = floatVal(item.sellingStatus[0].currentPrice[0]);
				const shipping = floatVal(item.shippingInfo[0].shippingServiceCost[0]);
				const total = basePrice + shipping;
				console.log(total);
				priceArray.push(total);
			}
		}
		return priceArray;
	} catch (err) {
		console.log('fetch failed', err);
	}
}



// incoming feed of discord posts
//   - find where command is sent
//   - if command, validate query
//   - if valid, search API
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
	if (message.content.startsWith(`${prefix}check`)) {
		const query = message.content.slice(8).trim();
		const priceArray = await getPriceArrayOfItem(query);
		const fairPrice = getFairPrice(priceArray);

		const embedBox = createEmbedBox(query, fairPrice.fairPrice, confidenceCalc(priceArray), fairPrice.accuracyMsg);
		message.channel.send(embedBox);

	}
});

client.login(credentials.token);


function createEmbedBox(query, fairPrice, confidence, accuracyMsg) {
	const embedBox = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Price Check Search Results')
		.addFields({
			name: 'Search',
			value: query
		}, {
			name: 'Fair price',
			value: '£' + fairPrice
		}, {
			name: 'Confidence',
			value: +confidence.toFixed(5) + '%'
		}, {
			name: 'Notes',
			value: accuracyMsg
		}, )
		.setTimestamp();

	return embedBox;
}


// calculate fair price
// return json {price, accuracyMsg}
//   - find price range
//   - if not 5 sold, accuracyMsg =  'inaccurate, not enough items to query'
//   - if price range >= 15% of highest price, accuracy = 'inaccurate, large variance'
//   - calculate average price & multiply by * 0.9
//   - return {price, accuracyMsg}

function getFairPrice(priceArray) {
	let accuracyMsg = '';

	const noOfItems = priceArray.length;
	const range = Math.max(...priceArray) - Math.min(...priceArray);
	const maxPrice = Math.max(...priceArray);
	let arrAvg = 0;

	if (noOfItems < 5) {
		accuracyMsg = '> inaccurate, not enough items to query'
	};
	if (range / maxPrice >= 0.15) {
		accuracyMsg = accuracyMsg + '> inaccurate, large price variance'
	};
	if (noOfItems === 5) {
		const medianPrices = priceArray.sort((a, b) => a - b).slice(1, 4);
		arrAvg = medianPrices.reduce((a, b) => a + b, 0) / 3;
	} else {
		arrAvg = priceArray.reduce((a, b) => a + b, 0) / noOfItems;
	}

	const fairPrice = (arrAvg * 0.9).toFixed(2);
	if (accuracyMsg === '') {
		accuracyMsg = "accurate, always double check"
	}

	return {
		fairPrice,
		accuracyMsg
	};

}


function confidenceCalc(priceArray) {
	const noOfItems = priceArray.length;
	const maxPrice = Math.max(...priceArray);
	const range = Math.max(...priceArray) - Math.min(...priceArray);

	// accuracy based on number of items (capped at 50%)
	const itemsAcc = clamp((noOfItems * 0.1), 0, 0.5);
	console.log('itemacc', itemsAcc);

	// accuracy based on the variance of price (capped at 50%)
	const priceRangeAcc = clamp((range / maxPrice), 0, 0.5);
	console.log('prAcc', priceRangeAcc);

	// confidence based on above accuracies with priceRangeAcc inverted
	const confidence = (0.5 - priceRangeAcc) + itemsAcc;

	console.log('confidence', confidence);
	return confidence * 100;
}