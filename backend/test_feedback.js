require("dotenv").config();
const { User, Feedback } = require("./models");
const sequelize = require("./config/database");

async function testFeedback() {
    try {
        await sequelize.authenticate();
        console.log("DB connected");

        // Find a random user to act as req.user
        const user = await User.findOne();
        if (!user) {
            console.log("No users in DB");
            process.exit(1);
        }

        console.log("Creating feedback for user:", user.id);

        const feedback = await Feedback.create({
            user_id: user.id,
            content: "Test feedback from script",
            contact: "test@example.com"
        });

        console.log("Success! Feedback created:", feedback.toJSON());
    } catch (error) {
        console.error("Error creating feedback:", error);
    } finally {
        process.exit(0);
    }
}

testFeedback();
