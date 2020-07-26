'use strict';

const credentials = require('./credentials');
const Discord = require('discord.js');
const ebay = require('./ebay');
const prefix = 'e!'; // easily change prefix

// incoming feed of discord posts
//   - find where command is sent
//   - if command, validate query
//   - if valid, search API
const client = new Discord.Client();

client.login(credentials.token); // login to discord

client.once('ready', () => { // initialise
	console.log('Ready!');
});

client.on('message', async message => { // on message received
	const check = `${prefix}check`;
	const help = `${prefix}help`;

	if (message.content.startsWith(check)) {
		const query = message.content.slice(check.length + 1).trim(); // remove prefix and command from query
		message.channel.send(await getEmbedBox(query));
	}
});

// return an embed box with information regarding the results found
async function getEmbedBox(query){
			const soldItems = await ebay.getSoldItems(query);
	
			if (soldItems) { // if items found
				const priceArray = ebay.getPriceArray(soldItems);
				const fairPrice = ebay.getFairPrice(priceArray);
				const confidence = ebay.getConfidence(priceArray);
				const accuracyMsg = ebay.getAccuracyMsg(priceArray);
	
				return createEmbedBox(query, fairPrice, confidence, accuracyMsg);
			}
			else {
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