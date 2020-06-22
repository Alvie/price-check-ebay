// incoming feed of discord posts
//   - find where command is sent
//   - if command, validate query
//   - if valid, search API

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

//   `fair price for ${QUERY} is ${price}, accuracy is ${accuracyMsg},
//   notice: pricing comes from ebay, maybe inaccurate even if bot suggests otheriwse.
//   if I am downvoted, its probably wrong`
