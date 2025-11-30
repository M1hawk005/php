const { formatDistanceToNow } = require('date-fns');
console.log(formatDistanceToNow(new Date(Date.now() - 10000)));
