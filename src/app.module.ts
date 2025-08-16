import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [    TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost', // Or your database host
    port: 5432, // Or your database port
    username: 'postgres',
    password: 'sachini',
    database: 'contact-management',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true, 
  }),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'),
    serveRoot: '/uploads',
  }),
  AuthModule, UsersModule, ContactsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
