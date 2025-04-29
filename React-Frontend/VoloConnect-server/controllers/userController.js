// controllers/userController.js
const { User, Skill, UserSkill } = require('../models');

exports.registerUser = async (req, res) => {
  try {
    const { skills, ...userData } = req.body;
    const user = await User.create(userData);
    
    if (skills && skills.length > 0) {
      await Promise.all(skills.map(async skillName => {
        const [skill] = await Skill.findOrCreate({ where: { skill_name: skillName } });
        await UserSkill.create({ user_id: user.user_id, skill_id: skill.skill_id });
      }));
    }
    
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: Skill,
        through: { attributes: [] }
      }]
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { skills, ...userData } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.update(userData);
    
    if (skills) {
      await UserSkill.destroy({ where: { user_id: user.user_id } });
      await Promise.all(skills.map(async skillName => {
        const [skill] = await Skill.findOrCreate({ where: { skill_name: skillName } });
        await UserSkill.create({ user_id: user.user_id, skill_id: skill.skill_id });
      }));
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Skill,
        through: { attributes: [] }
      }]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};