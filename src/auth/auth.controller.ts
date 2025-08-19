import { Controller, Post, Body, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/user/entity/user.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: User) {
    this.logger.debug(`register() : Register user`)
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    this.logger.debug(`login() : init login`)
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }
}
