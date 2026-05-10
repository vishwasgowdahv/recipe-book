// server/src/models/Rating.ts
import { Schema, model, Document, Types } from 'mongoose';

// Define the interface for a Rating document
export interface IRating extends Document {
  recipe: Types.ObjectId; // Reference to the Recipe being rated
  user: Types.ObjectId;   // Reference to the User who gave the rating
  rating: number;         // The numerical rating (e.g., 1 to 5)
  comment?: string;       // Optional text review
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>({
  recipe: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe', // Refers to the Recipe model
    required: [true, 'Rating must belong to a recipe'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Refers to the User model
    required: [true, 'Rating must belong to a user'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating value is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// --- THIS IS THE CORRECTION ---
// Add a unique compound index to ensure a user can only rate a specific recipe once
// This helps prevent multiple ratings from the same user on the same recipe
RatingSchema.index({ recipe: 1, user: 1 }, { unique: true });
// --- END OF CORRECTION ---


// Update `updatedAt` field on save
RatingSchema.pre<IRating>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Rating = model<IRating>('Rating', RatingSchema);

export default Rating;