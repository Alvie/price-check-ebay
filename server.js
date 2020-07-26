'use strict';

const credentials = require('./credentials');
const Discord = require('discord.js');
const ebay = require('./ebay');

 // easily change prefix
const prefix = 'e!';
// check if string has non-ASCII characters
const nonASCII = str => [...str].some(char => char.charCodeAt(0) > 127);

// instantiate a discord client
const client = new Discord.Client();

client.login(credentials.token); // login to discord

client.once('ready', () => { // initialise
	console.log('Ready!');
});

client.on('message', async message => { // on message received
	const check = `${prefix}check`;
	const help = `${prefix}help`;
	const helpMsg = `The command is:
\`${check}\`  followed by the product name
**Example**
> ${check} AMD Ryzen 7 3700x
	
For more popular items, you'll get better results with specificity.
**Example**
> 'EVGA RTX 2070 SUPER XC ULTRA' will get better results than 'EVGA RTX 2070'
	
For rare items, you'll get better results with less specificity.
**Example**
> 'Corsair SF450' will get better results than 'Corsair SF450 80+ Gold Modular PSU'
	
If you believe that there is a significant error or no results when there should be, please DM \`@AlvieMahmud#9999\` with your query, expected results and results you received.
	`;

	if (message.content.startsWith(prefix)) { // ignore any messages that doesn't start with prefix
		if (message.content.startsWith(check)) {
			if (message.content.length <= check.length + 9 || message.content.length >= check.length + 50 ) { // ignore queries with less than 9 characters for product name
				message.channel.send(`You must include a product name (longer than 8 characters / less than 50 characters) with your check.\n**Example**\n> ${check} AMD Ryzen 7 3700X`);
			} else if (nonASCII(message.content)) {
				message.channel.send(`Product name cannot contain non ASCII characters`);
			} else {
				const query = message.content.slice(check.length + 1).trim(); // remove prefix and command from query
				message.channel.send(await getEmbedBox(query));
			}
		}
		if (message.content.startsWith(help)) {
			message.channel.send(helpMsg);
		}
	}
});

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