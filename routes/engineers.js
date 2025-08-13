const { Op } = require("sequelize");
const express = require("express");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

// ✅ Get all engineers
router.get("/", auth, async (req, res) => {
  try {
    const engineers = await User.findAll({
      where: { role: "engineer" },
      attributes: { exclude: ["password"] },
    });
    res.json(engineers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get engineer capacity
router.get("/:id/capacity", auth, async (req, res) => {
  try {
    const engineer = await User.findByPk(req.params.id);
    if (!engineer || engineer.role !== "engineer") {
      return res.status(404).json({ message: "Engineer not found" });
    }

    const currentDate = new Date();

    // Replace with Sequelize equivalent if using Sequelize for Assignment
    const activeAssignments = await Assignment.findAll({
      where: {
        engineerId: req.params.id,
        startDate: { [Op.lte]: currentDate },
        endDate: { [Op.gte]: currentDate },
      },
      include: {
        model: require("../models/Project"),
        as: "Project",
        attributes: ["name"],
      },
    });

    const totalAllocated = activeAssignments.reduce(
      (sum, a) => sum + a.allocationPercentage,
      0
    );

    const availableCapacity = engineer.maxCapacity - totalAllocated;

    res.json({
      engineer: {
        id: engineer.id,
        name: engineer.name,
        maxCapacity: engineer.maxCapacity,
      },
      totalAllocated,
      availableCapacity,
      activeAssignments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update engineer profile
router.put("/:id", auth, async (req, res) => {
  try {
    const { skills, seniority, maxCapacity } = req.body;

    if (req.user.role === "engineer" && req.user.id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await User.update(
      { skills, seniority, maxCapacity },
      { where: { id: req.params.id } }
    );

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Engineer not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
