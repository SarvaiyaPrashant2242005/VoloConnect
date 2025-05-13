// controllers/participantController.js - Participant controller
const participantService = require('../services/participantService');

// Get all volunteers for an event
const getEventVolunteers = async (req, res) => {
  try {
    const volunteers = await participantService.getEventVolunteers(req.params.id);
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEventVolunteers
};