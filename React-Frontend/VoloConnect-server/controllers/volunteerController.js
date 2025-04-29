// controllers/volunteerController.js
const { AssignedVolunteer, Event, User } = require('../models');

exports.assignVolunteer = async (req, res) => {
  try {
    const assignment = await AssignedVolunteer.create(req.body);
    
    // Update the assigned volunteers count in the event
    const event = await Event.findByPk(req.body.event_id);
    if (event) {
      await event.update({
        assigned_volunteers: event.assigned_volunteers + 1
      });
    }
    
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await AssignedVolunteer.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Student' },
        { model: Event },
        { model: User, as: 'Faculty' }
      ]
    });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await AssignedVolunteer.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    await assignment.update(req.body);
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await AssignedVolunteer.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Update the assigned volunteers count in the event
    const event = await Event.findByPk(assignment.event_id);
    if (event) {
      await event.update({
        assigned_volunteers: Math.max(0, event.assigned_volunteers - 1)
      });
    }
    
    await assignment.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignmentsByEvent = async (req, res) => {
  try {
    const assignments = await AssignedVolunteer.findAll({
      where: { event_id: req.params.eventId },
      include: [{ model: User, as: 'Student' }]
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignmentsByUser = async (req, res) => {
  try {
    const assignments = await AssignedVolunteer.findAll({
      where: { student_id: req.params.userId },
      include: [{ model: Event }]
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};