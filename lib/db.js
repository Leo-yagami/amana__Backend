const mongoose = require("mongoose");
let cached = global.mongoose ?? {conn: null, promise: null};
global.mongoose = cached;

const MONGODB_URI = process.env.MONGODB_URI;

async function connectToDatabase() {
  if(mongoose.connection.readyState === 1){
    return mongoose.connection;
  }
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  if(!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
  }
  try {
    cached.conn = await cached.promise;
    console.log("MONGODB CONNECT WOOOOOOOOOO")
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}

module.exports = connectToDatabase
