import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeminiModule } from '~gemini/gemini.module';
import { ConfigModule } from '@nestjs/config';
import config from '~configs/env.config';

@Module({
  imports: [
    GeminiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
