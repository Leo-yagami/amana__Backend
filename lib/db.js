const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URI

if(!MONGODB_URI){
  throw new Error("Please define MONGODB_URI in your environment variables")
}

let cached = global.mongoose;

if(!cached) {
  cached = global.mongoose = {conn: null, promise: null}
}

async function connectToDatabase() {
  if(cached.conn){
    return cached.conn
  }

  if(!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: true,
      serverSelectionTimeoutMs: 5000,
      socketTimeoutMS: 30000,
    }).then((m)=>m)
  }
  cached.conn = await cached.promise;
  console.log("MONGODB CONNECT WOOOOOOOOOO")
  return cached.conn;
}

module.exports = connectToDatabase
