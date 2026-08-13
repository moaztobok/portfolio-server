import mongoose, { Schema, Document } from 'mongoose';

interface IImage {
    url: string;
    orientation: 'landscape' | 'portrait' | 'square';
}
interface IBlog extends Document {
    title: string;
    description: string;
    content: string;
    author: string;
    images: IImage[];
    tags: [];
    category: 'Graphic Design' | 'Photography' | 'Web Development';
    lastModified: string;
}
const imageSchema = new Schema({
    url: { type: String, required: true },
    orientation: {
        type: String,
        required: true,
        enum: ['landscape', 'portrait', 'square']
    }
});
const blogSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, required: true },
    author: { type: String, required: true },
    images: [imageSchema],
    tags: { type: [String], default: [] },
    category: {
        type: String,
        required: true,
        enum: ['Graphic Design', 'Photography', 'Web Development']
    }, uploadDate: { type: Date, default: Date.now },
    lastModified: { type: String },
}, {
    timestamps: true
});

blogSchema.index({ title: 'text', description: 'text', content: 'text' });

export default mongoose.model<IBlog>('Blog', blogSchema);