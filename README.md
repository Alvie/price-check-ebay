# price-check-ebay
 A tool that helps finding average price of product sold on ebay

## Installation
- Clone this repository
- run `npm i`
- set your prefix in `config.json` (default: $)
- set your discord token and ebay clientId in `credentials.json`
- run `node server`

#### Adaptability
This price check bot is geared towards used hardware prices in the UK. You can change location in the `ebay.js` file.  
Remove or adapt the `getQueryString`, `filterWords`, `addEdgeCases` functions in `ebay.js` as they contain hardware specific boolean search terms for filtering.  
**(Note: `function getSoldItems` uses `getQueryString()`, but you may use `query` instead of `queryString` for the keywords if you do not intend to use the filtering functions.)**

You can also change various parameters such as between new/used, sort order, etc in `ebay.js` using the codes available from https://developer.ebay.com/DevZone/finding/CallRef/findCompletedItems.html


## Usage
The command is:
`$check`  followed by the product name  
**Example**
> $check AMD Ryzen 7 3700x
	
For more popular items, you'll get better results with specificity.  
**Example**
> 'EVGA RTX 2070 SUPER XC ULTRA' will get better results than 'EVGA RTX 2070'
	
For rare items, you'll get better results with less specificity.  
**Example**
> 'Corsair SF450' will get better results than 'Corsair SF450 80+ Gold Modular PSU'
	
If you believe that there is a significant error or no results when there should be, please DM `@AlvieMahmud#9999` with your query, expected results and results you received.

## Improvements
- Many parts, specifically surrounding the boxPlot class may benefit from some optimisation and/or a refactor

## Credits
Gaurav - HardwareSwapUK Member (UI/UX)  
HardwareSwapUK #coding (general)

