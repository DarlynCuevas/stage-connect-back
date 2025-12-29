import { Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary con variables de entorno
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
import { Readable } from 'stream';


@Controller('upload')
export class UploadController {
    @Post('image')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'artime' },
                (error, result) => {
                    if (error || !result) {
                        return reject(error || new Error('No result from Cloudinary'));
                    }
                    resolve({ url: result.secure_url });
                }
            );
            Readable.from(file.buffer).pipe(uploadStream);
        });
    }
}