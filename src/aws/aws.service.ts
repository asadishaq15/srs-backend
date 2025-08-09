import { HttpStatus, Injectable } from '@nestjs/common';
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AwsService {
  private s3: S3Client;
  private bucketName: string;
  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  async generateSignedUrl(fileName: string, contentType: string) {
    try {
      const key = `${Date.now()}-${fileName}`;

      // Create a PutObjectCommand with the correct parameters
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      console.log(command)

      // Generate the signed URL
      const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 5 }); // URL expires in 5 minutes
      return {
        success: false,
        statusCode: HttpStatus.OK,
        msg: {
          url,
          key,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      console.log(e);
      return { success: false, statusCode: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }

  async deleteFile(key: string): Promise<any> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3.send(command);

      return {
        success: true,
        statusCode: HttpStatus.OK,
        msg: `File ${key} deleted successfully`,
      };
    } catch (error) {
      console.log(`Failed to delete file: ${error.message}`);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        msg: error.message,
      };
    }
  }
}
