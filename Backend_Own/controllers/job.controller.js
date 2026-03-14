 const Job = require('../models/Job.model');

/**
 * CREATE job
 */
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      basePrice: req.body.basePrice,
      priceUnit: req.body.priceUnit,
      createdBy: req.user.userId
    });

    res.status(201).json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};

/**
 * LIST jobs
 */
exports.getJobs = async (req, res) => {
  try {
    const filter = { deletedAt: null };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.active !== undefined)
      filter.active = req.query.active === 'true';

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
};

/**
 * GET single job
 */
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job || job.deletedAt)
      return res.status(404).json({ error: 'job not found' });

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
};

/**
 * UPDATE job
 */
exports.updateJob = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "invalid job id" });
    }

    const job = await Job.findById(req.params.id);
    if (!job || job.deletedAt)
      return res.status(404).json({ error: "job not found" });

    if (job.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: "not authorized" });
    }

    const allowedFields = ["name", "description", "category", "basePrice", "priceUnit"];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

/**
 * TOGGLE active status
 */
exports.toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job || job.deletedAt)
      return res.status(404).json({ error: 'job not found' });

    job.active = !job.active;
    await job.save();

    res.json({ success: true, active: job.active });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
};

/**
 * DELETE job (soft delete)
 */
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job)
      return res.status(404).json({ error: 'job not found' });

    job.deletedAt = new Date();
    await job.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
};
