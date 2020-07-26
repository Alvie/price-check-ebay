'use strict';

const ebay = require('../ebay');
const Discord = require('discord.js');
// easily change prefix in config.json
const { prefix } = require('../config.json');

// check if string has non-ASCII characters
const nonASCII = str => [...str].some(char => char.charCodeAt(0) > 127);

module.exports = {
	name: 'check',
	aliases: ['pc', 'chk', 'price', 'pricecheck'],
	cooldown: 5,
	args: true,
	description: 'Price check command',
	usage: '[product name]',
	async execute(message, args) {
		const query = args.join(' ');
		if (query.length < 10 || query.length > 50 ) { // ignore queries with less than 9 characters for product name
			message.channel.send(`You must include a product name (at least 10 characters / less than 50 characters) with your check.\n**Example**\n> ${prefix}check AMD Ryzen 7 3700X`);
		} else if (nonASCII(query)) {
			message.channel.send(`Product name cannot contain non ASCII characters`);
		} else {
			message.channel.send(await getEmbedBox(query));
		}
	},
};

// return an embed box with information regarding the results found
async function getEmbedBox(query) {
	const soldItems = await ebay.getSoldItems(query);

	if (soldItems) { // if items found
		const priceArray = ebay.getPriceArray(soldItems);
		const fairPrice = ebay.getFairPrice(priceArray);
		const confidence = ebay.getConfidence(priceArray);
		const accuracyMsg = ebay.getAccuracyMsg(priceArray);

		return createEmbedBox(query, fairPrice, confidence, accuracyMsg);
	} else {
		return createEmbedBox(query, 'N/A', 0, '> No items found for above query\n> Please try another search term\n> If you feel this is in error, PM @AlvieMahmud#9999');
	}
}

// creates a new embed box with specified parameters
// query = String
// fairPrice = String / Numeric Value
// confidence = Float / Numeric Value
// accuracyMsd = String
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