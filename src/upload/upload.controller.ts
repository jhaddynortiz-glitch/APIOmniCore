import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new HttpException('Solo se permiten imágenes', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      }
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Archivo no subido', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const result = await this.uploadService.uploadImage(file);
      
      return {
        url: result.url,
        filename: result.key,
        mimetype: file.mimetype,
      };
    } catch (error: any) {
      const errorMsg = error.message || 'Error desconocido';
      throw new HttpException(`Error subiendo imagen a S3: ${errorMsg}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
