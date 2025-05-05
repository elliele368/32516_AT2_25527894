import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
    vin: { type: String, required: true },
    name: { type: String, required: true },
    year: { type: String, required: true },
    brand: { type: String, required: true },
    type: { type: String, required: true },
    available: { type: Boolean, required: true },
    reserved: { type: Boolean, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String, required: true }
});

export const Car = mongoose.model("Cars", carSchema);