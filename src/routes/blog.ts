import { Router } from "express";
import { createBlog, deleteBlogById, getAllBlogs, getBlogById, updateBlogById, replaceBlogImage } from "../controllers/blog";
import { upload } from "../config/multer";
import { authenticateJWT } from "../config/auth";

const router = Router();

router.post('/', upload.array('files'), createBlog);
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.put('/:id', upload.array('files'), updateBlogById);
router.put('/:id/image/:index', upload.single('file'), replaceBlogImage);
router.delete('/:id', deleteBlogById);
export default router