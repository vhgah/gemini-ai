import { IsOptional, IsString } from 'class-validator';

export class GenerateReviewDto {
  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  productImageUrl?: string;

  @IsOptional()
  @IsString()
  productDescription?: string;
}
