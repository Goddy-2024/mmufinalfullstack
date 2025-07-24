import mongoose from 'mongoose';
export default async function connectDB(){
      try{
            await mongoose.connect(process.env.MONGODB_URI);
            console.log(`MongoDB integration success at port: ${process.env.MONGODB_URI}`);
            console.log(`connected to client: ${process.env.CLIENT_URL}`);
      }catch(error){
            console.error("Failed to connect to MONGODB");
      }

      

}