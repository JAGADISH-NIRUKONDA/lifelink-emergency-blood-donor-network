import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas (or local/in-memory instance during tests)
 * Reads connection URI and database name from environment variables.
 */
export const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined in environment variables. Please check your .env configuration.'
    );
  }

  try {
    const options = {
      dbName: process.env.DB_NAME || 'lifelink',
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    };

    const connectionInstance = await mongoose.connect(uri, options);

    console.log(
      `[Database] MongoDB Connected Successfully | Host: ${connectionInstance.connection.host} | DB: ${connectionInstance.connection.name}`
    );

    return connectionInstance;
  } catch (error) {
    console.error(`[Database] MongoDB Connection Error: ${error.message}`);
    // Only exit the process if not running under a test suite
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Disconnect from MongoDB for clean teardown during tests or server shutdown
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB Disconnected.');
  } catch (error) {
    console.error(`[Database] Disconnect Error: ${error.message}`);
  }
};

