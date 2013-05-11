var mongoose = require('mongoose');

var totalMinuteSchema = mongoose.Schema(
    { site: String,
      timestamp: Date,
      time: String,
      year: Number,
      month: Number,
      day: Number,
      hour: Number,
      minute: Number,
      hits: Number,
      browser: { Firefox: Number, Chrome: Number },
      pages: [ { page: String, hits: Number } ]
    }
);

// totalSchema.methods = {};
totalMinuteSchema.index({ site: 1, time: -1 })

mongoose.model('TotalMinute', totalMinuteSchema);
