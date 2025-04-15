import mongoose, { Schema, model, models } from 'mongoose';

const SubcategorySchema = new Schema({
  name: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Subcategory = models.Subcategory || model('Subcategory', SubcategorySchema);
export default Subcategory;
