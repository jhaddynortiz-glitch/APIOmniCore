import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';


@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string, key: string }> {
    if (!this.bucketName) {
      throw new InternalServerErrorException('AWS_S3_BUCKET_NAME no configurado');
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const key = `omnicore/${uniqueSuffix}${extname(file.originalname)}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          // ACL: 'public-read', // Quita esto si el bucket no tiene ACL públicos habilitados
        })
      );

      // Generar URL pública estándar de S3
      const region = process.env.AWS_REGION || 'us-east-1';
      const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;

      return { url, key };
    } catch (error) {
      console.error('Error subiendo a S3:', error);
      throw new InternalServerErrorException('Error subiendo la imagen a AWS S3');
    }
  }
}
