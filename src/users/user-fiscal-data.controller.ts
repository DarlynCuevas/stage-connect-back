import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { UserFiscalDataService } from './user-fiscal-data.service';
import { CreateUserFiscalDataDto, UpdateUserFiscalDataDto } from './dto/user-fiscal-data.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users/fiscal-data')
@UseGuards(AuthGuard('jwt'))
export class UserFiscalDataController {
  constructor(private readonly userFiscalDataService: UserFiscalDataService) {}

  @Get(':userId')
  async getFiscalData(@Param('userId', ParseIntPipe) userId: number) {
    return this.userFiscalDataService.findByUserId(userId);
  }

  @Post()
  async createFiscalData(@Body() createDto: CreateUserFiscalDataDto) {
    return this.userFiscalDataService.create(createDto);
  }

  @Put(':userId')
  async updateFiscalData(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateDto: UpdateUserFiscalDataDto,
  ) {
    return this.userFiscalDataService.update(userId, updateDto);
  }
}
