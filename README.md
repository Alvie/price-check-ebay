# price-check-ebay
 A tool that helps finding average price of product sold on ebay

## Installation
- Fork this repository
- run `npm i`
- set your prefix in `config.json` (default: £)
- set your discord token and ebay clientId in `credentials.json`
- run `node server`

#### Adaptability
This price check bot is geared towards used hardware prices in the UK. You can change location in the `ebay.js` file. Remove or adapt the removeWords() function in `ebay.js` as they contain hardware specific boolean search terms for filtering (Note: `function getSoldItems` uses removeWords(), but you may use `query` instead of `newQuery` for the keyword.)

You can also change various parameters such as between new/used, sort orde, etc in `ebay.js` using the codes available from https://developer.ebay.com/DevZone/finding/CallRef/findCompletedItems.html


## Usage
The command is:
`£check`  followed by the product name  
**Example**
> £check AMD Ryzen 7 3700x
	
For more popular items, you'll get better results with specificity.  
**Example**
> 'EVGA RTX 2070 SUPER XC ULTRA' will get better results than 'EVGA RTX 2070'
	
For rare items, you'll get better results with less specificity.  
**Example**
> 'Corsair SF450' will get better results than 'Corsair SF450 80+ Gold Modular PSU'
	
If you believe that there is a significant error or no results when there should be, please DM `@AlvieMahmud#9999` with your query, expected results and results you received.

## Improvements
- High variance is currently calculted as the range being 15% or more than the average price, a better variance algorithm should be used
- Many parts, specifically surrounding loops / conditions etc, may benefit from some optimisation and/or a refactor