import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SymbolsDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(16, { each: true })
  names: string[];
}
