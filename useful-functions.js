'use strict';

// limit the value of a variable
const clamp = (num, clamp, higher) => higher ? Math.min(Math.max(num, clamp), higher) : Math.min(num, clamp)
// extract and convert ebay's price object to a float value
const floatValue = priceObject => parseFloat(priceObject.__value__);
// range = max-min of numeric Array
const range = numArray => Math.max(...numArray) - Math.min(...numArray);
// average = sum / quantity of numeric Array
const average = numArray => numArray.reduce((a, b) => a + b, 0) / numArray.length;


module.exports = {
	clamp,
	floatValue,
	range,
	average
};