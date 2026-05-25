import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('keywords')
export class KeywordController {
  constructor(private readonly keywordService: KeywordService) {}

  @Post()
  create(@Request() req: any, @Body() createKeywordDto: CreateKeywordDto) {
    return this.keywordService.create(createKeywordDto, req.user.orgId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.keywordService.findAll(req.user.orgId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.keywordService.findOne(id, req.user.orgId);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateKeywordDto: UpdateKeywordDto,
  ) {
    return this.keywordService.update(id, updateKeywordDto, req.user.orgId);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.keywordService.remove(id, req.user.orgId);
  }
}
