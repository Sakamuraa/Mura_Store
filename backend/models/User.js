import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({ email:String, passwordHash:String }, { timestamps:true });
export default mongoose.model('User', UserSchema);
