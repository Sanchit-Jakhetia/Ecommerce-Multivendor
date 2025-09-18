import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Other" },
  line1: { type: String, default: null },
  line2: { type: String, default: null },
  city: { type: String, default: null },
  state: { type: String, default: null },
  postalCode: { type: String, default: null },
  country: { type: String, default: null }
}, { _id: false });

const phoneNumberSchema = new mongoose.Schema({
  label: { type: String, default: "Mobile" },
  number: { type: String, default: null }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "buyer" },
  addresses: { type: [addressSchema], default: [] },
  phoneNumbers: { type: [phoneNumberSchema], default: [] }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
