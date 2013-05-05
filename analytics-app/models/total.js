var mongoose = require('mongoose');

var totalSchema = mongoose.Schema(
    { site: String,
      timestamp: Date, 
      hits: Number }
);

// totalSchema.methods = {};

mongoose.model('Total', totalSchema);
