const Animal = require('../models/Animal');
const { notifyAnimalHealthChange } = require('../services/notificationJobs');

// @desc    Get all animals for a user
// @route   GET /api/animals
// @access  Private
exports.getAnimals = async (req, res) => {
  try {
    const animals = await Animal.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: animals.length,
      animals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single animal
// @route   GET /api/animals/:id
// @access  Private
exports.getAnimal = async (req, res) => {
  try {
    const animal = await Animal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }

    res.status(200).json({
      success: true,
      animal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new animal
// @route   POST /api/animals
// @access  Private
exports.createAnimal = async (req, res) => {
  try {
    const animalData = {
      ...req.body,
      userId: req.user._id
    };

    const animal = await Animal.create(animalData);

    res.status(201).json({
      success: true,
      animal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update animal
// @route   PUT /api/animals/:id
// @access  Private
exports.updateAnimal = async (req, res) => {
  try {
    let animal = await Animal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }

    const previousStatus = animal.healthStatus;

    animal = await Animal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Fire-and-forget push if the animal just became sick / quarantined / under treatment
    notifyAnimalHealthChange(req.user._id, animal, previousStatus);

    res.status(200).json({
      success: true,
      animal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete animal
// @route   DELETE /api/animals/:id
// @access  Private
exports.deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }

    await animal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Animal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get animal statistics
// @route   GET /api/animals/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const animals = await Animal.find({ userId: req.user._id });

    const stats = {
      total: animals.length,
      healthy: animals.filter(a => a.healthStatus === 'Healthy').length,
      sick: animals.filter(a => a.healthStatus === 'Sick').length,
      pregnant: animals.filter(a => a.pregnancyStatus === 'Pregnant').length,
      byType: {}
    };

    // Count by type
    animals.forEach(animal => {
      stats.byType[animal.type] = (stats.byType[animal.type] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add health record
// @route   POST /api/animals/:id/health
// @access  Private
exports.addHealthRecord = async (req, res) => {
  try {
    const animal = await Animal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }

    animal.healthRecords.push(req.body);
    await animal.save();

    res.status(201).json({
      success: true,
      animal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};