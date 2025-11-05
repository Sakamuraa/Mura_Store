import mongoose from 'mongoose';
const ItemSchema = new mongoose.Schema({ title:String, price:Number, description:String, image:String, file:String }, { _id:true });
const ProfileSchema = new mongoose.Schema({ owner:{ type: mongoose.Schema.Types.ObjectId, ref:'User'}, username:{type:String, unique:true}, displayName:String, bio:String, links:[{label:String,url:String}], items:[ItemSchema] }, { timestamps:true });
export default mongoose.model('Profile', ProfileSchema);
