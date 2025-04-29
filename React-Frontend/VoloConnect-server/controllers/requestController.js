// controllers/requestController.js
const { Request, User, Event } = require('../models');

exports.createRequest = async (req, res) => {
  try {
    const request = await Request.create(req.body);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [
        { model: User },
        { model: Event }
      ]
    });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (req.body.status && !['pending', 'approved', 'rejected'].includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    await request.update(req.body);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    await request.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRequestsByEvent = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { event_id: req.params.eventId },
      include: [{ model: User }]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRequestsByUser = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { student_id: req.params.userId },
      include: [{ model: Event }]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};