import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  amount: number;

  @IsString()
  type: 'initial' | 'counter' | 'final';

  @IsString()
  @IsOptional()
  message?: string;
}
