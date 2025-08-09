/* src/global/global.service.ts */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFileType } from 'utils/multer.config';
import { readFile, unlink } from 'fs/promises';

@Injectable()
export class GlobalService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.s3 = new S3Client({ region: process.env.AWS_REGION });
    this.bucket = process.env.AWS_S3_BUCKET_NAME as string;
  }

  /**
   * Upload a single file to AWS S3
   * @param file uploaded file from Multer
   * @param folder optional folder path within the bucket
   * @returns public URL of the uploaded file
   */
  async upload(file: UploadedFileType, folder?: string): Promise<string> {
    const fileExt = file.originalname.split('.').pop();
    const key = folder
      ? `${folder}/${uuidv4()}.${fileExt}`
      : `${uuidv4()}.${fileExt}`;

    try {
      const fileBody = await readFile(file.path);
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: fileBody,
          ContentType: this.getContentType(file.originalname),
        }),
      );

      // remove temporary local file
      await unlink(file.path);

      // return the publicly accessible URL
      return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Upload multiple files to AWS S3
   */
  async uploadMultiple(
    files: UploadedFileType[],
    folder?: string,
  ): Promise<string[]> {
    const promises = files.map((file) => this.upload(file, folder));
    return Promise.all(promises);
  }

  /**
   * Delete a file from AWS S3 by its key
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      return false;
    }
  }

  /**
   * Construct S3 file URL manually if needed
   */
  getFileUrl(key: string): string {
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  /**
   * Helper to determine content type based on file extension
   */
  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const map: Record<string,string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return map[ext || ''] || 'application/octet-stream';
  }
}



// /* eslint-disable prettier/prettier */
// import { Injectable } from '@nestjs/common';
// import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
// import { v4 as uuidv4 } from 'uuid';
// import { UploadedFileType } from 'utils/multer.config';
// import { promises as fs } from 'fs';

// @Injectable()
// export class GlobalService {
//   private containerName: string;
//   private azureConnection : string

//   constructor() {
//     this.azureConnection = process.env.AZURE_STORAGE_CONNECTION_STRING as string;

// }

//     // Method to get blob client
//     private getBlobClient(imageName: string): BlockBlobClient {
//     const blobClientService = BlobServiceClient.fromConnectionString(this.azureConnection);
//     const containerClient = blobClientService.getContainerClient(this.containerName);
//     const blobClient = containerClient.getBlockBlobClient(imageName);
//     return blobClient;
//     }

//   // Method to upload file to Azure Blob Storage
//   async upload(file: UploadedFileType): Promise<string> {
//     try {
//       const pdfUrl = uuidv4() + file.originalname;
//       const blobClient = this.getBlobClient(pdfUrl);
//       const buffer = await fs.readFile(file.path);
//       await blobClient.uploadData(buffer); // Upload file data
//       return pdfUrl; // Return URL of uploaded file
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       throw new Error('Failed to upload file');
//     }
//   }
// }
