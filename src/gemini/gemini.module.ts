import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { GeminiFlashModelProvider } from './gemini.provider';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService, GeminiFlashModelProvider],
})
export class GeminiModule {}
