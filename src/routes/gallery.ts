import { Router } from "express";
import { getImages, getImageById, updateImage } from "../controllers/gallery";
import { deleteImage } from "../controllers/uploadthing";
import { upload } from '../config/multer';
import { uploadImages } from '../controllers/uploadthing';

const router = Router();

router.get('/', getImages);
router.get('/:id', getImageById);
router.post('/', upload.array('files'), uploadImages);
router.put('/:id', updateImage);
router.delete('/:id', deleteImage);

export default router