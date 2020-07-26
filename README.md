# price-check-ebay
 A tool that helps finding average price of product sold on ebay

## Usage
The command is:
`e!check`  followed by the product name  
**Example**
> e!check AMD Ryzen 7 3700x
	
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