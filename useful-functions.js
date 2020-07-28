'use strict';

// limit the value of a variable
const clamp = (num, clamp, higher) => higher ? Math.min(Math.max(num, clamp), higher) : Math.min(num, clamp)
// extract and convert ebay's price object to a float value
const floatValue = priceObject => parseFloat(priceObject.__value__);
// max of numeric Array
const max = numArray => Math.max(...numArray)
// min of numeric Array
const min = numArray => Math.min(...numArray)
// range = max-min of numeric Array
const range = numArray => max(numArray) - min(numArray);
// average = sum / quantity of numeric Array
const average = numArray => numArray.reduce((a, b) => a + b, 0) / numArray.length;

// fair value calculator & fix to 2dp
const calcFair = value => (value*0.9).toFixed(2);

// !!!! FOLLOWING CODE IS ADAPTED FROM https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php !!!! \\

const quantile = (arr, q) => {
	const sorted = arr.sort((a, b) => a - b);
	const pos = (sorted.length - 1) * q;
	const base = Math.floor(pos);
	const rest = pos - base;
	if (sorted[base + 1] !== undefined) {
		return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
	} else {
		return sorted[base];
	}
};

// !!!!!! ABOVE CODE IS ADAPTED FROM https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php !!!!!! \\

class boxPlot {
	constructor(numArray) {
		this.numArray = numArray;

		this.lowerQuartile = quantile(numArray, .25);
		this.median = quantile(numArray, .50);
		this.upperQuartile = quantile(numArray, .75);
		this.interQuartile = this.upperQuartile - this.lowerQuartile;

		this.lowOutlier = this.lowerQuartile - (1.5 * this.interQuartile);
		this.highOutlier = this.upperQuartile + (1.5 * this.interQuartile);

		this.min = min(this.numArray.filter(num => num >= this.lowOutlier)); // minimum excluding outliers
		this.max = max(this.numArray.filter(num => num <= this.highOutlier)); // maximum excluding outliers
	}

	arrayNoOutliers() {
		return this.numArray.filter(num => this.min <= num & num <= this.max);
	}

	get avgNoOutliers() {
		return average(this.arrayNoOutliers());
	}

	get variance() { 
		const varianceRange = (this.max - this.min);
		if (varianceRange === 0) {
			return 1;
		} else {
			return this.interQuartile / varianceRange;
		}
	}
}

module.exports = {
	clamp,
	floatValue,
	range,
	average,
	calcFair,
	boxPlot
};