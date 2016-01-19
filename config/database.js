module.exports = function () {
  var url = process.env.PROD_MONGODB || 'mongodb://localhost:27017/test';
  return {url: url};
}
