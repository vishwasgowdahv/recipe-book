// server/src/models/MealPlan.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMealPlan extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    recipeId: mongoose.Schema.Types.ObjectId;
    date: Date;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner';
}

const MealPlanSchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    mealType: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner'],
        required: true,
    },
}, {
    timestamps: true,
});

const MealPlan = mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);

export default MealPlan;