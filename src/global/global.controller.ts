/* eslint-disable prettier/prettier */
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GlobalService } from './global.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions, UploadedFileType } from 'utils/multer.config';

@Controller('global')
export class GlobalController {
  constructor(private readonly globalService: GlobalService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadToAzureBlobStorage(
    @UploadedFile() file: UploadedFileType,
  ): Promise<string> {
    return await this.globalService.upload(file);
  }
}
