/*
 * Serve JSON to our AngularJS client
 */

exports.name = function (req, res) {
  res.json({
    name: 'Bob'
  });
};

exports.total = function (req, res) {
  res.json({ text: 'Hello' });
};
