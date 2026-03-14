const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller");
const { authenticate } = require('../middlewares/auth.middleware');


router.post("/", authenticate, jobController.createJob);


router.get("/", jobController.getJobs);


router.get("/:id", jobController.getJobById);


router.put("/:id", authenticate, jobController.updateJob);


router.patch("/:id/toggle-status", authenticate, jobController.toggleJobStatus);


router.delete("/:id", authenticate , jobController.deleteJob);


module.exports = router;
