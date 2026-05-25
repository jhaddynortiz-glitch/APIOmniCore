import { IsString, IsNotEmpty } from 'class-validator';

export class CreateKeywordDto {
  @IsString()
  @IsNotEmpty()
  keyword: string;

  @IsString()
  @IsNotEmpty()
  response: string;
}
