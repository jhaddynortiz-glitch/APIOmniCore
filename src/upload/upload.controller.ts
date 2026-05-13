import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new HttpException('Solo se permiten imágenes (jpg, png, gif)', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Archivo no subido', HttpStatus.BAD_REQUEST);
    }
    
    // Devolvemos la URL pública
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;
    
    return {
      url: fileUrl,
      filename: file.filename,
      mimetype: file.mimetype,
    };
  }
}
