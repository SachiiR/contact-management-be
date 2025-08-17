import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ContactsService } from 'src/contact/contact.service';
import { UsersService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }
    @Get()
    findAll(@Request() req: any, @Query('page') page: number, @Query('limit') limit: number, @Query('search') search?: string) {
      return this.usersService.findAll(req.user, page, limit, search);
    }
}
