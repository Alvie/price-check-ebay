'use strict';

// easily change prefix in config.json
const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	aliases: ['?', 'h'],
	cooldown: 5,
	description: 'Instructions on how to use price check',
	execute(message) {
		const helpMsg = `\`\`\`
COMMAND: ${prefix}check [item to search]
EXAMPLE: ${prefix}check AMD Ryzen 7 3700x CPU

For popular items, be more specific. With rarer items, be less.
Ensure manufacturer names are included and product names and models are correct.

Examples:

	[POPULAR]
	- 'EVGA RTX 2070 SUPER XC ULTRA' > 'EVGA RTX 2070'

	[RARE]
	- 'Corsair SF450' > 'Corsair SF450 80+ Gold Modular PSU'

	[MANUFACTURER NAME + CORRECTNESS]
	- 'HyperX Cloud II' > 'Cloud 2 PC Headset'

⚠ ALWAYS DOUBLE CHECK ⚠
- Prices found from ebay based on your search with 10% off
- May be wrong even with high confidence

If you believe that there is a significant error or no results when there should be, please DM @AlvieMahmud#9999 with your product name, expected results and results you received.
\`\`\``;
		message.channel.send(helpMsg);
	},
};