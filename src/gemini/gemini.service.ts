import { Inject, Injectable } from '@nestjs/common';
import { createContent } from '~helpers/gemini.helper';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { GenAiResponse } from './interface/response.interface';
import { GEMINI_FLASH_MODEL, safetySettings } from '../configs/gemini.config';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { GenerateReviewDto } from './dto/generate-review.dto';

@Injectable()
export class GeminiService {
  private model: string;

  constructor(
    @Inject(GEMINI_FLASH_MODEL) private readonly genAI: GoogleGenerativeAI,
    private readonly configService: ConfigService,
  ) {
    this.model = this.configService.get<string>('GEMINI.MODEL');
  }

  async generateText(prompt: string): Promise<GenAiResponse> {
    const contents = createContent(prompt);

    const model = this.genAI.getGenerativeModel({ model: this.model });

    const { totalTokens } = await model.countTokens({ contents });

    const result = await model.generateContent({ contents });
    const response = result.response;

    const text = response.text();

    return {
      totalTokens,
      text,
    };
  }

  async extractLabelData(file: Express.Multer.File) {
    const generationConfig = {
      responseMimeType: 'application/json',
    };

    const model = this.genAI.getGenerativeModel({
      model: this.model,
      generationConfig,
      safetySettings,
    });

    const prompt = `Using this shipping label file, please extract the information 
    and provide it in JSON format with the following structure:
    If the country is missing, try to infer the country based on the city and zip code
    {
      "customer": {
        "name": "<customer_name>",
        "address": {
          "street": "<customer_address_street>",
          "city": "<customer_address_city>",
          "state": "<customer_address_state>",
          "zip": "<customer_address_zip>",
          "country": "<customer_address_country>"
        },
        "phone": "<customer_phone>",
        "email": "<customer_email>"
      },
      "sender": {
        "name": "<sender_name>",
        "address": {
          "city": "<sender_address_city>",
          "country": "<sender_address_country>"
        },
      },
      "shipping": {
        "carrier": "<shipping_carrier>",
        "method": "<shipping_method>",
        "tracking_number": "<tracking_number>",
        "tracking_url": "<tracking_url>",
      }
    }
    Please fill in the extracted information where possible, and return the result in the above JSON format.`;

    const contents = createContent(prompt, file);

    const { totalTokens } = await model.countTokens({ contents });

    const result = await model.generateContent({ contents });
    const response = result.response;

    const text = response.text();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (error) {
      throw new Error('Failed to parse response as JSON: ' + error.message);
    }

    return {
      totalTokens,
      data: parsedResponse,
    };
  }

  async generateReview(data: GenerateReviewDto): Promise<any> {
    // Construct the base prompt
    let prompt = `Write a detailed review for the product named "${data.productName}".`;

    if (data.productDescription) {
      prompt += ` The product description is: "${data.productDescription}".`;
    }

    prompt += `The review should include:
      1. A brief description of the product’s key features.
      2. A statement on the product's performance or effectiveness.
      3. A mention of how the product benefits the user.
      4. A recommendation for the product, highlighting its best features.
      5. A star rating (from 1 to 5 stars) based on the review.
      6. If possible, add a personal touch as if written by a real customer, including how the product improved their experience.

      Format the review as follows:

      {
        "review_text": "<Full review content>",
        "star_rating": "<Rating from 1 to 5>"
      }`;

    // Prepare image part if productImageUrl is provided
    let imageParts: Part[] = [];
    if (data.productImageUrl) {
      try {
        const response = await fetch(data.productImageUrl);
        const imageBuffer = await response.buffer();
        const base64Image = imageBuffer.toString('base64');

        imageParts = [
          {
            inlineData: {
              mimeType: response.headers.get('content-type') || 'image/jpeg',
              data: base64Image,
            },
          },
        ];
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    }

    // Prepare contents including image parts if available
    const contents = [
      {
        role: 'user',
        parts: [
          ...imageParts,
          {
            text: prompt,
          },
        ],
      },
    ];

    const generationConfig = {
      responseMimeType: 'application/json',
    };

    // Get the model and generate the review
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      generationConfig,
    });
    const { totalTokens } = await model.countTokens({ contents });
    const result = await model.generateContent({ contents });
    const response = result.response;

    const text = response.text();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (error) {
      throw new Error('Failed to parse response as JSON: ' + error.message);
    }

    return {
      totalTokens,
      data: parsedResponse,
    };
  }
}
