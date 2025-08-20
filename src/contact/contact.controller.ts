import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, Query, UploadedFile, UseInterceptors, BadRequestException, Logger } from '@nestjs/common';
import { ContactsService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import type { Express } from 'express';
import { Contact } from './entity/contact.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class ContactsController {
  private readonly logger = new Logger(ContactsController.name)
  constructor(private contactsService: ContactsService) { }

  @Post()
  create(@Body() body: any, @Request() req: any) {
    this.logger.debug(`create() : Create contact: ${JSON.stringify(req.user)}`)
    return this.contactsService.create(body, req.user);
  }

  @Get('all')
  @Roles('admin')
  findAll(@Request() req: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string) {
    this.logger.debug(`findall() : Fetch all contacts: 
      user - ${JSON.stringify(req.user)},`)
    return this.contactsService.findAll( page, limit, search, sortBy, order);
  }

  @Get()
  findByUser(@Request() req: any,
    @Query('selectedUserId') selectedUserId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string) {
    this.logger.debug(`findByUser() : Fetch all contacts: 
      user - ${JSON.stringify(req.user)}, selectedUserId - ${selectedUserId}`)
    return this.contactsService.findByUser(req.user, selectedUserId, page, limit, search, sortBy, order);
  }


  @Put(':id')
  update(@Param('id') id: string, @Body() body: Contact) {
    this.logger.debug(`update() : Update contact : id - ${JSON.stringify(id)}, contact - ${JSON.stringify(body)}`)
    return this.contactsService.update(id, body);
  }
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    this.logger.debug(`remove() : Delete contact: 
      user - ${JSON.stringify(req.user)}, id - ${id}`)
    return this.contactsService.remove(id, req.user);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),   
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.debug(`uploadFile() : Upload photo: file - ${JSON.stringify(file)}}`)
    if (!file) {
      this.logger.error(`uploadFile() : No file uploaded`)
      throw new BadRequestException('No file uploaded');
    }
    return { filename: file.filename, path: `/uploads/${file.filename}` };
  }
}
