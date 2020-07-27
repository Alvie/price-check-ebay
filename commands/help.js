'use strict';

// easily change prefix in config.json
const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	aliases: ['?', 'h'],
	cooldown: 5,
	description: 'Instructions on how to use price check',
	execute(message) {
		const helpMsg = `The command is:
\`${prefix}check [product name]\`
**Example**
> ${prefix}check AMD Ryzen 7 3700x
	
For more popular items, you'll get better results with specificity.
**Example**
> 'EVGA RTX 2070 SUPER XC ULTRA' will get better results than 'EVGA RTX 2070'
	
For rare items, you'll get better results with less specificity.
**Example**
> 'Corsair SF450' will get better results than 'Corsair SF450 80+ Gold Modular PSU'

Ensure product names and models are correct.
**Example**
> 'HyperX Cloud II' will get better results than 'Hyper X Cloud 2'

**NOTE: Even if the bot replies it is confident, take it with a grain of salt and ALWAYS DOUBLE CHECK.**

If you believe that there is a significant error or no results when there should be, please DM \`@AlvieMahmud#9999\` with your product name, expected results and results you received.
		`;
		message.channel.send(helpMsg);
	},
};