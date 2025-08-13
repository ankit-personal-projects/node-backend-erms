const sequelize = require('../config/database');
const User = require('../models/User');
const Project = require('../models/Project');
const Assignment = require('../models/Assignment');
require('dotenv').config();

const seedData = async () => {
  try {
    await sequelize.sync({ force: true });

    // Create manager
    const manager = await User.create({
      email: "ankit.kumar@geekyants.com",
      password: "ankit123",
      name: "Ankit Kumar",
      role: "manager"
    });

    // Create engineers
    const engineers = await User.bulkCreate([
      {
        email: "ankit.kumar.it@geekyants.com",
        password: "ankit123",
        name: "Ankit Aryan",
        role: "engineer",
        skills: ["React", "Node.js", "TypeScript", "MySQL"],
        seniority: "senior",
        maxCapacity: 100
      },
      {
        email: "abcd@geekyants.com",
        password: "ankit123",
        name: "Abcd Pqrs",
        role: "engineer",
        skills: ["Python", "Django", "PostgreSQL"],
        seniority: "mid",
        maxCapacity: 100
      },
      {
        email: "test@geekyants.com",
        password: "ankit123",
        name: "Test Test",
        role: "engineer",
        skills: ["React", "Vue.js", "CSS"],
        seniority: "junior",
        maxCapacity: 50
      },
      {
        email: "test2@geekyants.com",
        password: "ankit123",
        name: "Mr Kumar",
        role: "engineer",
        skills: ["Node.js", "MongoDB", "Express"],
        seniority: "senior",
        maxCapacity: 100
      }
    ]);

    // Create projects
    const projects = await Project.bulkCreate([
      {
        name: "HRMS",
        description: "Building a new human resource management system with React and Node.js",
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-06-22"),
        requiredSkills: ["React", "Node.js", "TypeScript"],
        teamSize: 3,
        status: "active",
        managerId: manager.id
      },
      {
        name: "Data Analytics Dashboard",
        description: "Python-based analytics dashboard for business intelligence",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-05-31"),
        requiredSkills: ["Python", "Django", "PostgreSQL"],
        teamSize: 2,
        status: "active",
        managerId: manager.id
      },
      {
        name: "E-Commerce Web App",
        description: "Vue.js frontend with Node.js backend for shopping platform",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-07-01"),
        requiredSkills: ["Vue.js", "Node.js", "MongoDB"],
        teamSize: 4,
        status: "active",
        managerId: manager.id
      },
      {
        name: "Internal DevOps Tool",
        description: "Build internal tooling for automated deployments and monitoring",
        startDate: new Date("2025-03-15"),
        endDate: new Date("2025-06-30"),
        requiredSkills: ["Node.js", "Express", "MySQL"],
        teamSize: 2,
        status: "active",
        managerId: manager.id
      }
    ]);

    // Create assignments
    await Assignment.bulkCreate([
      {
        engineerId: engineers[0].id,
        projectId: projects[0].id,
        allocationPercentage: 80,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-06-22"),
        role: "Tech Lead"
      },
      {
        engineerId: engineers[1].id,
        projectId: projects[1].id,
        allocationPercentage: 100,
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-05-31"),
        role: "Backend Developer"
      },
      {
        engineerId: engineers[2].id,
        projectId: projects[2].id,
        allocationPercentage: 50,
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
        role: "Frontend Intern"
      },
      {
        engineerId: engineers[3].id,
        projectId: projects[2].id,
        allocationPercentage: 100,
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
        role: "Backend Developer"
      },
      {
        engineerId: engineers[0].id,
        projectId: projects[3].id,
        allocationPercentage: 60,
        startDate: new Date("2025-03-20"),
        endDate: new Date("2025-06-30"),
        role: "DevOps Engineer"
      },
      {
        engineerId: engineers[1].id,
        projectId: projects[3].id,
        allocationPercentage: 40,
        startDate: new Date("2025-03-20"),
        endDate: new Date("2025-06-30"),
        role: "Database Admin"
      }
    ]);

    console.log("✅ Seed data created successfully!");
    console.log("🔐 Login credentials:");
    console.log("Manager: ankit.kumar@geekyants.com / ankit123");
    console.log("Engineers:");
    console.log("- ankit.kumar.it@geekyants.com");
    console.log("- abcd@geekyants.com");
    console.log("- test@geekyants.com");
    console.log("- test2@geekyants.com");
    console.log("Password for all: ankit123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
