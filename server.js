const ebayNode = require('ebay-node-api');
const Discord = require('discord.js');
const credentials = require('./credentials');

const prefix = 'e!'; // easily change prefix, also change
const boolSearchArr = ['pro', 'plus', 'max', 'super', 'bundle', 'combo', 'faulty', 'ti', 'xt', 'spare', 'spares', 'repair', 'repairs', 'cooler', 'pc', 'damaged', 'broken'];

// limit the value of a variable
const clamp = (num, clamp, higher) => higher ? Math.min(Math.max(num, clamp), higher) : Math.min(num, clamp)
// extract and convert ebay's price object to a float value
const floatValue = priceObject => parseFloat(priceObject.__value__);
// range = max-min of numeric Array
const range = numArray => Math.max(...numArray) - Math.min(...numArray);
// average = sum / quantity of numeric Array
const average = numArray => numArray.reduce((a, b) => a + b, 0) / numArray.length;


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
	for (const word of boolSearchArr) {
		if (inputStr.includes(word)) {
			newSearchArr = newSearchArr.filter(subStr => subStr !== word);
		}
	}
	return '-' + newSearchArr.join(' -'); // ['a', 'b'] -> '-a -b'
}

async function getSoldItems(query) {
	newQuery = query + ' ' + removeWords(query.toLowerCase()); // filter versions (pro, max, plus, ti, super, xt) etc
	console.log('checking', newQuery)
	try {
		const data = await ebay.findCompletedItems({
			keywords: newQuery,
			sortOrder: 'EndTimeSoonest', // Most Recent
			Condition: 3000, // Used
			SoldItemsOnly: true, // Sold & Completed
			entriesPerPage: 10
		});

		const items = data[0].searchResult[0].item;
		return items;
	} catch (err) {
		console.log('fetch failed', err);
	}
}

function getPriceArray(items) {
	let priceArray = [];
	if (!items) {
		priceArray = [0];
	} else {
		for (item of items) {
			const basePrice = floatValue(item.sellingStatus[0].currentPrice[0]);
			const shipping = floatValue(item.shippingInfo[0].shippingServiceCost[0]);
			const total = basePrice + shipping;
			priceArray.push(total);
		}
	}
	return priceArray;
}



// incoming feed of discord posts
//   - find where command is sent
//   - if command, validate query
//   - if valid, search API
const client = new Discord.Client();

client.login(credentials.token); // login to discord

client.once('ready', () => {     // initialise
	console.log('Ready!');
});

client.on('message', async message => {  // on message received
	const check = `${prefix}check`;
	if (message.content.startsWith(check)) {

		const query = message.content.slice(check.length + 1).trim(); // remove prefix and commands from query
		const soldItems = await getSoldItems(query);
		const priceArray = getPriceArray(soldItems);
		const fairPrice = getFairPrice(priceArray);

		const embedBox = createEmbedBox(query, fairPrice.fairPrice, confidenceCalc(priceArray), fairPrice.accuracyMsg);
		message.channel.send(embedBox);
	}
});

function createEmbedBox(query, fairPrice, confidence, accuracyMsg) {
	const embedBox = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Price Check Search Results')
		.addFields({
			name: 'Search',
			value: `\`${query}\``
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
	let accuracyMsg = '> Inaccurate: \n'; // set as Inaccurate as default

	const noOfItems = priceArray.length;
	const maxPrice = Math.max(...priceArray);
	let arrAvg = 0;

	if (noOfItems < 5) {
		accuracyMsg += '> - not enough items to query\n'
	};
	if (range / maxPrice >= 0.15) {
		accuracyMsg += '> - large price variance\n'
	};
	if (noOfItems >= 5) {
		const medianPrices = priceArray.sort((a, b) => a - b).slice(1, -1); // removes min and max
		arrAvg = average(medianPrices);
	} else {
		arrAvg = average(priceArray);
	}

	const fairPrice = (arrAvg * 0.9).toFixed(2);
	if (accuracyMsg === '> Inaccurate: \n') { // remove default if no change
		accuracyMsg = '> Accurate \n';
	}

	accuracyMsg +=  '- always double check';

	return {
		fairPrice,
		accuracyMsg
	};

}

function confidenceCalc(priceArray) {
	const noOfItems = priceArray.length;
	const maxPrice = Math.max(...priceArray);

	// accuracy based on number of items (capped at 50%)
	const itemsAcc = clamp((noOfItems * 0.1), 0, 0.5);

	// accuracy based on the variance of price (capped at 50%)
	const priceRangeAcc = clamp((range(priceArray) / maxPrice), 0, 0.5);

	// confidence based on above accuracies with priceRangeAcc inverted
	const confidence = (0.5 - priceRangeAcc) + itemsAcc;
	return confidence * 100;
}