const mongoose = require("mongoose");
let cached = global.mongoose ?? {conn: null, promise: null};
global.mongoose = cached;

async function connectToDatabase() {
  if(mongoose.connection.readyState === 1){
    return mongoose.connection;
  }
  if(!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMs: 5000,
      socketTimeoutMS: 45000,
    })
  }
  try {
    cached.conn = await cached.promise;
    console.log("MONGODB CONNECT WOOOOOOOOOO")
  } catch (error) {
    cached.promuse = null;
    throw e;
  }
  return cached.conn;
}

module.exports = connectToDatabase
