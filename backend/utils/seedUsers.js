const User = require("../models/User");

const seedUsers = async () => {
  try {
    // Check if test users already exist
    const existingAdmin = await User.findOne({
      email: "anup.bubay9986@gmail.com",
    });
    const existingUser1 = await User.findOne({
      email: "sayan.nandi@example.com",
    });
    const existingUser2 = await User.findOne({
      email: "sayan.mondal@example.com",
    });

    if (!existingAdmin) {
      await User.create({
        clerkUserId: "test_admin_1",
        email: "anup.bubay9986@gmail.com",
        fullName: "Anup Kundu",
        role: "admin",
      });
      console.log("[Seed] Created test admin user: Anup Kundu");
    }

    if (!existingUser1) {
      await User.create({
        clerkUserId: "test_user_1",
        email: "sayan.nandi@example.com",
        fullName: "Sayan Nandi",
        role: "user",
      });
      console.log("[Seed] Created test user: Sayan Nandi");
    }

    if (!existingUser2) {
      await User.create({
        clerkUserId: "test_user_2",
        email: "sayan.mondal@example.com",
        fullName: "Sayan Mondal",
        role: "user",
      });
      console.log("[Seed] Created test user: Sayan Mondal");
    }
  } catch (error) {
    console.error("[Seed] Error seeding users:", error.message);
  }
};

module.exports = seedUsers;
