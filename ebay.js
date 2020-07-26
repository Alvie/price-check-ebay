'use strict';

const credentials = require('./credentials');
const ebayNode = require('ebay-node-api');
const u = require('./useful-functions');

// ebay conn
const ebay = new ebayNode({
	clientID: credentials.clientId,
	countryCode: 'EBAY-GB',
	headers: {
		'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB' // For Great Britain https://www.ebay.co.uk
	}
});

// filters words that exist in query string to
// avoid contradiction which leads to no results (e.g. iPhone 11 Pro -pro)
// (NOTE: remove or adapt this function if you will not be filtering for hardware)
function filterWords(query) {
	const wordArray = ['pro', 'plus', 'max', 'super', 'bundle', 'combo', 'faulty', 'ti', 'xt', 'spare', 'spares', 'repair', 'repairs', 'cooler', 'pc', 'damaged', 'broken', 'with'];
	return wordArray.filter(word => !query.includes(word));
}

// adds in edge cases for query
// (NOTE: remove or adapt this function if you will not be filtering for hardware)
function addEdgeCases(wordArray, query) {
	// common inclusion of 'max' in product title of processors (i.e. max boost);
	if (wordArray.includes('max') && (query.includes('amd') || query.includes('intel'))) {
		return wordArray.filter(word => word !== 'max'); // removes word max the array
	}
	else {
		return wordArray;
	}
}

// this function adds in the required boolean search
// operators for a better result
// (NOTE: remove or adapt this function if you will not be filtering for hardware)
function getQueryString(query) {
	// filter out words that are in query and then add in edge cases
	const wordsToRemove = addEdgeCases(
		filterWords(query),
		query
	);
	return `${query} -${wordsToRemove.join(' -')}`; // ['a', 'b'] -> 'query -a -b' i.e. iPhone 11 -pro -max etc
}

// searches ebay for the most recent sold items
// for a given search term
// and returns items as an array
async function getSoldItems(query) {
	console.log('Checking: ', query)
	const queryString = getQueryString(query.toLowerCase()); // filter versions (pro, max, plus, ti, super, xt) etc (NOTE: remove this line if you will not be filtering)
	console.log(queryString);
	try {
		const data = await ebay.findCompletedItems({
			keywords: queryString, // (NOTE: change to query if you will not be filtering)
			sortOrder: 'EndTimeSoonest', // Most Recent
			Condition: 3000, // Used
			SoldItemsOnly: true, // Sold & Completed
			entriesPerPage: 10
		});

		if (!data[0].searchResult) { return; }
		const items = data[0].searchResult[0].item;
		return items;
	} catch (err) {
		console.log('fetch failed', err);
		return;
	}
}

// get the total price of each item sold from an array of items
function getPriceArray(items) {
	let priceArray = [];
	if (items) { // if not an empty array
		for (const item of items) {
			const basePrice = u.floatValue(item.sellingStatus[0].currentPrice[0]);
			const shipping = u.floatValue(item.shippingInfo[0].shippingServiceCost[0]);
			const total = basePrice + shipping;
			priceArray.push(total);
		}
	}
	return priceArray;
}

// calculate fair price
//   - calculate average price & multiply by * 0.9
function getFairPrice(priceArray) {
	let arrAvg = 0;

	// if more than five values found, remove the most extreme values and take an average
	if (priceArray.length >= 5) {
		const medianPrices = priceArray.sort((a, b) => a - b).slice(1, -1); // removes min and max
		arrAvg = u.average(medianPrices);
	} else {
		arrAvg = u.average(priceArray);
	}

	return (arrAvg * 0.9).toFixed(2); // 10% off of average to account for ebay fees
}

// get confidence as percentage
// based on noOfItems found and the price range
function getConfidence(priceArray) {
	const maxPrice = Math.max(...priceArray);

	// accuracy based on number of items (capped at 50%)
	const itemsAcc = u.clamp((priceArray.length * 0.1), 0, 0.5);

	// accuracy based on the variance of price (capped at 50%)
	const priceRangeAcc = u.clamp((u.range(priceArray) / maxPrice), 0, 0.5);

	// confidence based on above accuracies with priceRangeAcc inverted
	const confidence = (0.5 - priceRangeAcc) + itemsAcc;
	return confidence * 100;
}

// include accuracy message
//   - find price range
//   - if not 5 sold, accuracyMsg =  'inaccurate, not enough items to query'
//   - if price range >= 15% of average price, accuracy = 'inaccurate, large variance'
function getAccuracyMsg(priceArray) {
	let accuracyMsg = '> **Inaccurate:** \n'; // set as Inaccurate as default

	// append inacccuracy messages
	if (priceArray.length < 5) {
		accuracyMsg += '> - not enough items to query\n'
	};
	if (u.range(priceArray) / u.average(priceArray) >= 0.15) {
		accuracyMsg += '> - large price variance\n'
	};

	if (accuracyMsg === '> **Inaccurate:** \n') { // remove default if no change
		accuracyMsg = '> **Accurate** \n';
	}

	accuracyMsg += '**⚠ Always double check ⚠**';

	return accuracyMsg;
}

module.exports = {
	getSoldItems,
	getPriceArray,
	getFairPrice,
	getConfidence,
	getAccuracyMsg
};