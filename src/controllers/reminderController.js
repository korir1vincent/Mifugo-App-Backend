const Reminder = require('../models/Reminder');

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id })
      .populate('animalId', 'name tagId type')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get upcoming reminders
// @route   GET /api/reminders/upcoming
// @access  Private
exports.getUpcomingReminders = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      userId: req.user._id,
      date: { $gte: today, $lte: nextWeek },
      completed: false
    })
      .populate('animalId', 'name tagId type')
      .sort({ date: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create reminder
// @route   POST /api/reminders
// @access  Private
exports.createReminder = async (req, res) => {
  try {
    const reminderData = {
      ...req.body,
      userId: req.user._id
    };

    const reminder = await Reminder.create(reminderData);

    res.status(201).json({
      success: true,
      reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
exports.updateReminder = async (req, res) => {
  try {
    let reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const update = { ...req.body };
    // A new date means the push should fire again for the new date
    if (update.date) {
      update.notifiedDayBefore = false;
      update.notifiedDue = false;
    }

    reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark reminder as completed
// @route   PUT /api/reminders/:id/complete
// @access  Private
exports.completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    reminder.completed = true;
    reminder.completedAt = new Date();
    await reminder.save();

    res.status(200).json({
      success: true,
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    await reminder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};