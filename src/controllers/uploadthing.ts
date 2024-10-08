import { Request, Response } from 'express';
import { UTApi } from 'uploadthing/server';
import Image from '../models/imageModel';

export const utapi = new UTApi({
    apiKey: process.env.UPLOADTHING_SECRET
});

export const uploadImages = async (req:Request, res:Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    try {
        const fileObjects = (req.files as Express.Multer.File[]).map(file => 
            new File([file.buffer], file.originalname, { type: file.mimetype })
        );

        const uploadedFiles = await utapi.uploadFiles(fileObjects, {
            metadata: { userId: 'Moaz Tobok' }
        });

        const savedImages = await Promise.all(uploadedFiles.map(file => {
            const newImage = new Image({
                imageUrl: file.data?.url,
                imageType: req.body.imageType || 'artwork', // Default to 'artwork' if not specified
                title: file.data?.name || 'Untitled',
                userId: 'Moaz Tobok'
            });
            return newImage.save();
        }));

        console.log(`Upload completed for userId: Moaz Tobok`);
        console.log("Files URLs:", savedImages.map(img => img.imageUrl));

        res.json({
            message: 'Files uploaded successfully',
            files: savedImages
        });
    } catch (error:any) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
}
export const deleteImage = async (req: Request, res: Response) => {
    const imageId = req.params.id;

    try {
        // Find the image in the database
        const image = await Image.findById(imageId);

        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        // Extract the file key from the URL
        const fileKey = image.imageUrl.split('/').pop();

        if (!fileKey) {
            return res.status(400).json({ error: "Invalid image URL" });
        }

        // Delete the file from UploadThing
        await utapi.deleteFiles(fileKey);

        // Delete the image from the database
        await Image.findByIdAndDelete(imageId);

        res.json({ message: "Image deleted successfully" });
    } catch (error: any) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image', message: error.message });
    }
};