// incoming feed of discord posts
//   - find where command is sent
//   - if command, validate query
//   - if valid, search API

// Clamp function lodash alternative
function clamp (num, clamp, higher) {
  higher ? Math.min(Math.max(num, clamp), higher) : Math.min(num, clamp)
}

const Discord = require('discord.js');
const client = new Discord.Client();
const _ = require('lodash');

const credentials = require('./credentials');

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (message.content.startsWith('^check')) {
		const query = message.content.slice(6).trim();
		const embedBox = createEmbedBox(query, "£250.00", confidenceCalc(4,0,100));
		message.channel.send(embedBox);

	}
});

client.login(credentials.token);


function createEmbedBox(query, fairPrice, confidence) {
	const embedBox = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Price Check Search Results')
		.addFields({
			name: 'Search',
			value: query
		}, {
			name: 'Fair price',
			value: fairPrice
		}, {
			name: 'Confidence',
			value: +confidence.toFixed(5) + '%'
		})
		.setTimestamp();

	return embedBox;
}
// search API
//   - UK only
//   - condition used
//   - filter spares / repairs / faulty
//   - return prices (inc P&P) of last 5 sold

// calculate fair price
// return json {price, accuracyMsg}
//   - find price range
//   - if not 5 sold, accuracyMsg =  'inaccurate, not enough items to query'
//   - if price range >= 15% of highest price, accuracy = 'inaccurate, large variance'
//   - calculate average price & multiply by * 0.9
//   - return {price, accuracyMsg}

// send message (query, price, accuracyMsg)

//   `fair price for ${QUERY} is ${price}, accuracy is ${accuracyMsg}.
//   notice: pricing comes from ebay, maybe inaccurate even if bot suggests otheriwse.
//   if I am downvoted, its probably wrong`

function confidenceCalc(noOfItems, range, maxPrice) {

	// accuracy based on number of items (capped at 50%)
	const itemsAcc = clamp((noOfItems * 0.1), 0, 0.5);

	// accuracy based on the variance of price (capped at 50%)
	const priceRangeAcc = clamp((range / maxPrice), 0, 0.5);
	
	// confidence based on above accuracies with priceRangeAcc inverted
	const confidence = (0.5 - priceRangeAcc) + itemsAcc;

	return confidence * 100;
}