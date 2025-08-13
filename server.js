require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

// Import models
const User = require("./models/User");
const Project = require("./models/Project");
const Assignment = require("./models/Assignment");

// Import routes
const authRoutes = require("./routes/auth");
const engineerRoutes = require("./routes/engineers");
const projectRoutes = require("./routes/projects");
const assignmentRoutes = require("./routes/assignments");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection and model associations
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL database");

    // Define associations
    User.hasMany(Assignment, { foreignKey: "engineerId", as: "Assignments" });
    Project.hasMany(Assignment, { foreignKey: "projectId", as: "Assignments" });
    Assignment.belongsTo(User, { foreignKey: "engineerId", as: "Engineer" });
    Assignment.belongsTo(Project, { foreignKey: "projectId", as: "Project" });
    Project.belongsTo(User, { foreignKey: "managerId", as: "Manager" });

    await sequelize.sync({ alter: true });
    console.log("Database synchronized");
  } catch (error) {
    console.error("Database connection error:", error);
  }
})();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/engineers", engineerRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/assignments", assignmentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {

  console.log("DB Config:", {
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST,
  });
  console.log(`Server running on port ${PORT}`);
});
