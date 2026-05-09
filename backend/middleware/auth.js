const { getAuth, clerkClient } = require("@clerk/express");
const User = require("../models/User");

const ADMIN_EMAIL = "anupbubay9986@gmail.com";

const syncClerkUser = async (req, res, next) => {
  try {
    // getAuth(req) retrieves the auth state set by clerkMiddleware()
    const auth = getAuth(req);
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required. Please sign in." });
    }

    let user = await User.findOne({ clerkUserId: userId });
    
    if (!user) {
      // First time login - fetch user details from Clerk and create DB record
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email;

      // Determine role: admin if email matches admin email
      const role = email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "user";

      // Check if there's an existing user with this email (legacy migration)
      user = await User.findOne({ email });

      if (user) {
        user.clerkUserId = userId;
        user.fullName = fullName;
        user.role = role;
        user.password = undefined;
        await user.save();
      } else {
        user = new User({
          clerkUserId: userId,
          email,
          fullName,
          role,
        });
        await user.save();
      }
    } else {
      // Existing user - check if role needs update based on email
      const expectedRole = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "user";
      
      if (user.role !== expectedRole) {
        user.role = expectedRole;
        await user.save();
      }
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("[Auth] Error syncing Clerk user:", error.message || error);
    
    // If it's a Clerk token verification error, return 401
    if (error.message?.includes("token") || error.message?.includes("jwt") || error.message?.includes("session")) {
      return res.status(401).json({ message: "Invalid session. Please sign in again." });
    }
    
    res.status(500).json({ message: "Error syncing user data" });
  }
};

module.exports = syncClerkUser;
