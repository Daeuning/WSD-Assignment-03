const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  experience: { type: String, required: true },
  education: { type: String, required: true },
  employment_type: { type: String, required: true },
  salary: { type: String, required: true },
  stack_tags: { type: [String], required: true },
  deadline: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  applications: { type: Number, default: 0 },
});

module.exports = mongoose.model('Job', jobSchema);
