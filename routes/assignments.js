const express = require("express");
const { Op } = require("sequelize");
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const Project = require("../models/Project");
const { auth, requireRole } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Get all assignments
router.get("/", auth, async (req, res) => {
  try {
    const { engineerId, projectId } = req.query;
    const where = {};

    if (engineerId) where.engineerId = engineerId;
    if (projectId) where.projectId = projectId;

    if (req.user.role === "engineer") {
      where.engineerId = req.user.id;
    }

    const assignments = await Assignment.findAll({
      where,
      include: [
        {
          model: User,
          as: "Engineer",
          attributes: ["name", "email", "skills"]
        },
        {
          model: Project,
          as: "Project",
          attributes: ["name", "description", "status"]
        }
      ]
    });

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create assignment
router.post(
  "/",
  [
    auth,
    requireRole(["manager"]),
    body("engineerId").notEmpty(),
    body("projectId").notEmpty(),
    body("allocationPercentage").isInt({ min: 1, max: 100 }),
    body("startDate").isISO8601(),
    body("endDate").isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        engineerId,
        projectId,
        allocationPercentage,
        startDate,
        endDate,
        role
      } = req.body;

      const engineer = await User.findByPk(engineerId);
      if (!engineer || engineer.role !== "engineer") {
        return res.status(404).json({ message: "Engineer not found" });
      }

      // Check capacity
      const overlappingAssignments = await Assignment.findAll({
        where: {
          engineerId,
          [Op.and]: [
            { startDate: { [Op.lte]: new Date(endDate) } },
            { endDate: { [Op.gte]: new Date(startDate) } }
          ]
        }
      });

      const totalAllocated = overlappingAssignments.reduce(
        (sum, a) => sum + a.allocationPercentage,
        0
      );

      if (totalAllocated + allocationPercentage > engineer.maxCapacity) {
        return res.status(400).json({
          message: "Assignment would exceed engineer capacity",
          availableCapacity: engineer.maxCapacity - totalAllocated
        });
      }

      const assignment = await Assignment.create({
        engineerId,
        projectId,
        allocationPercentage,
        startDate,
        endDate,
        role: role || "Developer"
      });

      const populatedAssignment = await Assignment.findByPk(assignment.id, {
        include: [
          {
            model: User,
            as: "Engineer",
            attributes: ["name", "email", "skills"]
          },
          {
            model: Project,
            as: "Project",
            attributes: ["name", "description", "status"]
          }
        ]
      });

      res.status(201).json(populatedAssignment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update assignment
router.put("/:id", [auth, requireRole(["manager"])], async (req, res) => {
  try {
    await Assignment.update(req.body, {
      where: { id: req.params.id }
    });

    const updatedAssignment = await Assignment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "Engineer",
          attributes: ["name", "email", "skills"]
        },
        {
          model: Project,
          attributes: ["name", "description", "status"]
        }
      ]
    });

    if (!updatedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(updatedAssignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete assignment
router.delete("/:id", auth, requireRole(["manager"]), async (req, res) => {
  try {
    const deleted = await Assignment.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
