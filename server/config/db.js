import mongoose from 'mongoose';
export default async function connectDB(){
      try{
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fellowship_db';
            await mongoose.connect(mongoUri);
            console.log(`MongoDB integration success at: ${mongoUri}`);
            console.log(`connected to client: ${process.env.CLIENT_URL || 'http://localhost:5174'}`);
      }catch(error){
            console.error("Failed to connect to MONGODB:", error.message);
            // For development, we'll continue without MongoDB for now
            console.log("Continuing without database connection...");
      }
}