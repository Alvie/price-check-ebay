'use strict';

const ebay = require('../ebay');
const Discord = require('discord.js');
const u = require('../useful-functions');
// easily change prefix in config.json
const { prefix } = require('../config.json');

// check if string has non-ASCII characters
const nonASCII = str => [...str].some(char => char.charCodeAt(0) > 127);

const BEST_RESULTS = `\`\`\`
- Make sure to include manufacturer for best results
- $help for more info
\`\`\``

const DOUBLE_CHECK = `\`\`\`
- Prices found from eBay based on your search with 10% off
- May be wrong even with high confidence
\`\`\``

module.exports = {
	name: 'check',
	aliases: ['pc', 'chk', 'price', 'pricecheck', 'search'],
	cooldown: 5,
	args: true,
	description: 'Price check command',
	usage: '[product name]',
	async execute(message, args) {
		const query = args.join(' ');
		if (query.length < 10 || query.length > 50) { // ignore queries with less than 9 characters for product name
			message.channel.send(`You must include a product name (at least 10 characters / less than 50 characters) with your check.
**Example**
> ${prefix}check AMD Ryzen 7 3700X`);
		} else if (nonASCII(query)) {
			message.channel.send(`Product name cannot contain non ASCII characters`);
		} else {
			const userJoinDate = await message.guild.member(message.author).joinedAt;
			const showWarn = u.showWarn(userJoinDate);
			const embedBox = await getEmbedBox(query, showWarn);
			try {
				// 30 days ago >= joinDate
				console.log(Date.now());
				const sentEmbed = await message.channel.send(embedBox);
				if (sentEmbed.embeds[0].color !== 0) { // error color = 0 
					await sentEmbed.react('✅');
					await sentEmbed.react('❌');
				}
			} catch {
				err =>
					console.log('send failed', err);
				return;
			}
		}
	}
};


// return an embed box with information regarding the results found
async function getEmbedBox(query, showWarn) {
	const soldItems = await ebay.getSoldItems(query);

	if (soldItems) { // if items found
		const priceArray = ebay.getPriceArray(soldItems);
		const priceBP = new u.boxPlot(priceArray);
		// use values from boxPlot, calcFair = * 0.9 and 2dp
		const fairPriceRange = `£${u.calcFair(priceBP.lowerQuartile)} - £${u.calcFair(priceBP.upperQuartile)}`;
		const median = `£${u.calcFair(priceBP.median)}`;
		const average = `£${u.calcFair(priceBP.avgNoOutliers)}`;

		console.log(`Fair price: ${fairPriceRange}
Median: ${median}
Average: ${average}`);

		const confidence = ebay.getConfidence(priceArray, priceBP.variance);
		const confidenceMsg = ebay.getConfidenceMsg(priceArray, priceBP.variance);

		return createEmbedBox(query, fairPriceRange, median, average, confidence, confidenceMsg, showWarn);
	} else {
		console.log(`No items found for ${query}`);
		return createEmbedBox(query, 'N/A', 'N/A', 'N/A', 0, `Make sure to include manufacturer for best results (${prefix}help for more info)
Please try another search term
If you feel this is in error, DM <@135464598999400448>`, false);
	}
}

// get color based on confidence level
function getColour(confidence) {
	if (confidence >= 80) {
		return '#78b159'; //green
	} else if (confidence >= 60) {
		return '#fdcb58'; // yellow
	} else if (confidence >= 40) {
		return '#ffac33'; // orange
	} else {
		return '#dd2e44'; // red
	}
}


// creates a new embed box with specified parameters
// query = String
// fairPriceRange = String / Numeric Value
// median = String / Numeric Value
// average = String / Numeric Value
// confidence = Float / Numeric Value
// confidenceMsg = String
function createEmbedBox(query, fairPriceRange, median, average, confidence, confidenceMsg, showWarn) {
	let embedBox = new Discord.MessageEmbed();
	if (fairPriceRange === 'N/A') {
		embedBox
			.setTitle('Error')
			.setColor('#000000') // set error color to 0
			.addFields({
				name: `No results found for:  \`${query}\``,
				value: confidenceMsg
			}, {
				name: '🔎 BEST RESULTS 🔍',
				value: BEST_RESULTS
			})
			.setTimestamp();
	} else {
		embedBox
			.setTitle(`Results found for: \`${query}\``)
			.setColor(getColour(confidence))
			.addFields({
				name: 'Fair price',
				value: fairPriceRange,
				inline: true
			}, {
				name: 'Median',
				value: median,
				inline: true
			}, {
				name: 'Average',
				value: average,
				inline: true
			}, {
				name: 'Confidence',
				value: `${+confidence.toFixed(2) + '%'}` + confidenceMsg
			}, {
				name: '🔎 BEST RESULTS 🔍',
				value: BEST_RESULTS
			});
		
		// add double check message if join date is less than 30 days
		if (showWarn) embedBox.addFields({ name: '⚠ ALWAYS DOUBLE CHECK ⚠',value: DOUBLE_CHECK });
		// add react message and set timestamp
		embedBox.addFields({ name: '\u200B', value: 'React ✅ or ❌' }).setTimestamp();
	}

	return embedBox;
}