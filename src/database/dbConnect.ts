import mongoose, { Connection } from "mongoose";

let cachedConnection: Connection | null = null;

/**
 * AUTO-FUNCTION-COMMENT: connectToDatabase
 * Purpose: Handles connect to database.
 * Line-by-line:
 * 1. Executes `if (cachedConnection && cachedConnection.readyState >= 1) {`.
 * 2. Executes `return cachedConnection;`.
 * 3. Executes `}`.
 * 4. Executes `if (mongoose.connection.readyState >= 1) {`.
 * 5. Executes `cachedConnection = mongoose.connection;`.
 * 6. Executes `return cachedConnection;`.
 * 7. Executes `}`.
 * 8. Executes `try {`.
 * 9. Executes `const mongoUri: string =`.
 * 10. Executes `process.env.NODE_ENV === "production"`.
 * 11. Executes `? process.env.MONGODB_URI_CLOUD || ""`.
 * 12. Executes `: process.env.MONGODB_URI_LOCAL ||`.
 * 13. Executes `"mongodb://localhost:27017/barbdegree2";`.
 * 14. Executes `if (!mongoUri) {`.
 * 15. Executes `throw new Error(`.
 * 16. Executes `"MongoDB URI is not defined in the environment variables."`.
 * 17. Executes `);`.
 * 18. Executes `}`.
 * 19. Executes `const { connection } = await mongoose.connect(mongoUri);`.
 * 20. Executes `if (connection.readyState >= 1) {`.
 * 21. Executes `console.log("Database Connected");`.
 * 22. Executes `cachedConnection = connection;`.
 * 23. Executes `}`.
 * 24. Executes `return connection;`.
 * 25. Executes `} catch (error) {`.
 * 26. Executes `console.error("Database connection failed:", error);`.
 * 27. Executes `throw error;`.
 * 28. Executes `}`.
 */
const connectToDatabase = async (): Promise<Connection> => {
  if (cachedConnection && cachedConnection.readyState >= 1) {
    return cachedConnection;
  }
  
  // Check if we have an existing mongoose connection not in our cache variable
  if (mongoose.connection.readyState >= 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  try {
    const mongoUri: string =
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_CLOUD || ""
        : process.env.MONGODB_URI_LOCAL ||
          "mongodb://localhost:27017/barbdegree2";

    if (!mongoUri) {
      throw new Error(
        "MongoDB URI is not defined in the environment variables."
      );
    }

    const { connection } = await mongoose.connect(mongoUri);

    if (connection.readyState >= 1) {
      console.log("Database Connected");
      cachedConnection = connection;
    }

    return connection;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export default connectToDatabase;
