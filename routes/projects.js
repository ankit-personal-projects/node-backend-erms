const express = require("express");
const { Op } = require("sequelize");
const Project = require("../models/Project");
const User = require("../models/User");
const { auth, requireRole } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Get all projects
router.get("/", auth, async (req, res) => {
  try {
    const { status, skills } = req.query;
    const where = {};

    if (status) where.status = status;

    if (skills) {
      const skillsArray = skills.split(",");
      where.requiredSkills = { [Op.overlap]: skillsArray }; // assuming JSON array
    }

    const projects = await Project.findAll({
      where,
      include: {
        model: User,
        as: "Manager",
        attributes: ["name", "email"]
      }
    });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single project
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: {
        model: User,
        as: "Manager",
        attributes: ["name", "email"]
      }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create project
router.post(
  "/",
  [
    auth,
    requireRole(["manager"]),
    body("name").notEmpty(),
    body("description").notEmpty(),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
    body("teamSize").isInt({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        description,
        startDate,
        endDate,
        requiredSkills,
        teamSize,
        status
      } = req.body;

      const project = await Project.create({
        name,
        description,
        startDate,
        endDate,
        requiredSkills: requiredSkills || [],
        teamSize,
        status: status || "planning",
        managerId: req.user.id
      });

      const projectWithManager = await Project.findByPk(project.id, {
        include: {
          model: User,
          as: "Manager",
          attributes: ["name", "email"]
        }
      });

      res.status(201).json(projectWithManager);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update project
router.put("/:id", [auth, requireRole(["manager"])], async (req, res) => {
  try {
    await Project.update(req.body, {
      where: { id: req.params.id }
    });

    const updatedProject = await Project.findByPk(req.params.id, {
      include: {
        model: User,
        as: "Manager",
        attributes: ["name", "email"]
      }
    });

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Find suitable engineers
router.get("/:id/suitable-engineers", auth, requireRole(["manager"]), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const engineers = await User.findAll({
      where: {
        role: "engineer",
        skills: { [Op.overlap]: project.requiredSkills }
      },
      attributes: { exclude: ["password"] }
    });

    res.json(engineers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
