const express = require('express');
const router = express.Router();
const studyPlanRoutes = require('./studyPlanRoutes');

// Register study plan routes
router.use('/study-plan', studyPlanRoutes);

module.exports = router;
