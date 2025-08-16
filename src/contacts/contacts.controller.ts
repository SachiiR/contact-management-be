import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, Query, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import type { Express } from 'express';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  create(@Body() body: any, @Request() req: any) {
    console.log('Authenticated User:', req.user);
    console.log(body); 
    return this.contactsService.create(body, req.user);
  }

  @Get()
  findAll(@Request() req: any, @Query('search') search?: string) {
    return this.contactsService.findAll(req.user, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.contactsService.findOne(id, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.contactsService.update(id, body, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.contactsService.remove(id, req.user);
  }

  @Post('upload')
@UseInterceptors(
  FileInterceptor('photo', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),   // always project-root/uploads
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }),
)
uploadFile(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  return { filename: file.filename, path: `/uploads/${file.filename}` };
}
}
