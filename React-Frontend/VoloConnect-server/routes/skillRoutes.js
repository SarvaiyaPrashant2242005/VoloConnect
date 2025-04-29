// routes/skillRoutes.js
const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

// Create a new skill
router.post('/', skillController.createSkill);

// Get all skills
router.get('/', skillController.getAllSkills);

// Delete a skill
router.delete('/:id', skillController.deleteSkill);

module.exports = router;