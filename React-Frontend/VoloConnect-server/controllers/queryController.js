// controllers/queryController.js
const { Query, User, Event } = require('../models');

exports.createQuery = async (req, res) => {
  try {
    const query = await Query.create(req.body);
    res.status(201).json(query);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.answerQuery = async (req, res) => {
  try {
    const query = await Query.findByPk(req.params.id);
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }
    
    await query.update({
      answer: req.body.answer,
      answered_at: new Date()
    });
    
    res.json(query);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getQueryById = async (req, res) => {
  try {
    const query = await Query.findByPk(req.params.id, {
      include: [
        { model: User },
        { model: Event }
      ]
    });
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }
    res.json(query);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteQuery = async (req, res) => {
  try {
    const query = await Query.findByPk(req.params.id);
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }
    await query.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQueriesByEvent = async (req, res) => {
  try {
    const queries = await Query.findAll({
      where: { event_id: req.params.eventId },
      include: [{ model: User }]
    });
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQueriesByUser = async (req, res) => {
  try {
    const queries = await Query.findAll({
      where: { student_id: req.params.userId },
      include: [{ model: Event }]
    });
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};