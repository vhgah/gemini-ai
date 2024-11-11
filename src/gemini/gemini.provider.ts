import { GoogleGenerativeAI } from '@google/generative-ai';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GEMINI_FLASH_MODEL } from '~configs/gemini.config';

export const GeminiFlashModelProvider: Provider<GoogleGenerativeAI> = {
  provide: GEMINI_FLASH_MODEL,
  useFactory: (configService: ConfigService) => {
    const token = configService.get<string>('GEMINI.KEY');
    return new GoogleGenerativeAI(token);
  },
  inject: [ConfigService],
};
