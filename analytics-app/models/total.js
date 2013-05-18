var mongoose = require('mongoose');

var totalSchema = mongoose.Schema({
  site: String,
  timestamp: Date,
  hits: Number,
  browser: {
    Firefox: Number,
    Chrome: Number
  },
  os: {
    Linux: Number
  },
  platform: {
    Linux: Number
  },
  userid: {
    anonymous: Number
  },
  ipAddresses: [{
    ip: String,
    hits: Number
  }],
  pages: [{
    page: String,
    hits: Number
  }]
});

// totalSchema.methods = {};

totalSchema.index({ site: 1 });

mongoose.model('Total', totalSchema);
