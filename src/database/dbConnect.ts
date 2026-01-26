import mongoose, { Connection } from "mongoose";

let cachedConnection: Connection | null = null;

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
