import { Request, Response } from "express";
import Image from "../models/imageModel";

interface GetImagesQuery {
    imageType?: string;
    page?: number;
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
}


export const getImages = async (req: Request, res: Response) => {
    try {
        const { imageType, page, limit, sort } = req.query as GetImagesQuery;


        const query: { imageType?: string } = {};
        if (imageType) {
            query.imageType = imageType;
        }
        const images = await Image.find(req.query as GetImagesQuery)
            .sort(sort)
            .skip(page ? (limit ? (page - 1) * limit : 0) : 0)
            .limit(limit ? limit : 0)
            .exec();

        res.json(images);
    } catch (error: any) {
        console.error("Error fetching images:", error);
        res.status(500).json({ error: "Failed to fetch images", message: error.message });
    }
};

export const getImageById = async (req: Request, res: Response) => {
    const imageId = req.params.id;

    try {
        const image = await Image.findById(imageId);

        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        res.json(image);
    } catch (error: any) {
        console.error("Error fetching image:", error);
        res.status(500).json({ error: "Failed to fetch image", message: error.message });
    }
};