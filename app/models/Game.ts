import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGame extends Document {
    name: string;
    gradeLevel: number;
    description: string;
    fileUrl: string;
    fileName: string;
    uploadedAt: Date;
}

const GameSchema: Schema = new Schema({
    name: { type: String, required: true },
    gradeLevel: { type: Number, required: true },
    description: { type: String, required: false },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
});

const Game: Model<IGame> = mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);

export default Game;
