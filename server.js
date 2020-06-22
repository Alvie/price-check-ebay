// incoming feed of discord posts
//   - find where command is sent
//   - if command, validate query
//   - if valid, search API

const Discord = require('discord.js');
const client = new Discord.Client();

const credentials = require('./credentials');

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (message.content.startsWith('^check')) {
		const query = message.content.slice(6);
		const embedBox = createEmbedBox(query, "£250.00", "0.87");
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
			value: confidence
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