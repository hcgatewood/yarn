module.exports = function () {
  var dbUrl = process.env.PROD_MONGODB || 'mongodb://localhost:27017/test';
  return {url: dbUrl};
}
