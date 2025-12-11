import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateManagerRequestDto {
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @IsOptional()
  @IsString()
  message?: string;
}
