import mongoose, { Connection } from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI!;

const connectToDatabase = async (): Promise<Connection> => {
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
    }

    return connection;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export default connectToDatabase;

// import mongoose, { Connection } from "mongoose";

// let cachedConnection: Connection | null = null;

// const connectToDatabase = async (): Promise<Connection> => {
//   if (cachedConnection && cachedConnection.readyState >= 1) {
//     return cachedConnection;
//   }

//   try {
//     const isProd = process.env.NODE_ENV === "production";

//     const mongoUri: string = process.env.MONGODB_URI_CLOUD as string
//       // : (process.env.MONGODB_URI_LOCAL as string);

//     if (!mongoUri) {
//       throw new Error(
//         "❌ MongoDB URI is not defined in environment variables."
//       );
//     }

//     const { connection } = await mongoose.connect(mongoUri);

//     if (connection.readyState >= 1) {
//       console.log(
//         `✅ Database connected (${isProd ? "CLOUD" : "LOCAL"}) → ${
//           connection.name
//         }`
//       );
//     }

//     cachedConnection = connection;
//     return connection;
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("❌ Database connection failed:", error.message);
//       throw error;
//     } else {
//       console.error("❌ Database connection failed:", error);
//       throw new Error("Unknown error occurred during database connection.");
//     }
//   }
// };

// export default connectToDatabase;
