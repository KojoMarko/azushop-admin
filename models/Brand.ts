import mongoose, { Schema, model, models } from 'mongoose';

const BrandSchema = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Brand = models.Brand || model('Brand', BrandSchema);
export default Brand;
