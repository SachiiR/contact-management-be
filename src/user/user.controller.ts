import { Controller, Get, Query, UseGuards, Request, Put, Body, Param, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from './user.service';
import { User } from './entity/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name)
  constructor(private usersService: UsersService) { }
  @Get()
  async findAll(@Request() req: any, @Query('page') page: number, @Query('limit') limit: number, @Query('search') search?: string) {
    this.logger.debug(`findAll() : Fetching all users: ${JSON.stringify(req.user)}`)
    return await this.usersService.findAll(req.user, page, limit, search);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: User) {
    this.logger.debug(`update() : Update user - id:${id}, user - ${JSON.stringify(body)}`)
    return await this.usersService.update(id, body);
  }
}
