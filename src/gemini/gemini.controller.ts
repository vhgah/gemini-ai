import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GenerateTextDto } from './dto/generate-text.dto';
import { GenAiResponse } from './interface/response.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { GenerateReviewDto } from './dto/generate-review.dto';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('text')
  generateText(@Body() dto: GenerateTextDto): Promise<GenAiResponse> {
    return this.geminiService.generateText(dto.prompt);
  }

  @Post('shipping-label/read')
  @UseInterceptors(FileInterceptor('file'))
  readShippingLabel(@UploadedFile() file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    if (
      !['image/png', 'image/jpeg', 'application/pdf', 'image/gif'].includes(
        file.mimetype,
      )
    ) {
      throw new Error(
        'Invalid file type. Only PNG, JPEG, PDF, and GIF files are allowed.',
      );
    }

    return this.geminiService.extractLabelData(file);
  }

  @Post('review/generate')
  generateReview(@Body() generateReviewDto: GenerateReviewDto) {
    return this.geminiService.generateReview(generateReviewDto);
  }
}
