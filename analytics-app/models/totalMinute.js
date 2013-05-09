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
      browser: { Firefox: Number, Chrome: Number }
    }
);

// totalSchema.methods = {};

mongoose.model('TotalMinute', totalMinuteSchema);
