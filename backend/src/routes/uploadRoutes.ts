import express from 'express';
import multer from 'multer';
import { uploadVCF } from '../controllers/uploadController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/vcf', upload.single('vcfFile'), uploadVCF);

export default router;
