import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async validateUser(email: string, password: string) {
    try {
      this.logger.log(`validateUser() : Validate user`)
      const user = await this.usersService.findByEmail(email);
      if (!user) return null;
      this.logger.log(`validateUser() : user not found`)
      const isMatch = await bcrypt.compare(password, user.password);
      this.logger.log(`validateUser() : ${isMatch}`)
      return isMatch ? user : null;
    } catch (error) {
      this.logger.error(`validateUser() : Error validating user : ${error}`)
      throw new BadRequestException(`Error validating user`)
    }
  }

  async login(user: User) {
    try{
      this.logger.log(`login() : Login user`);
      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload), user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
      };
    } catch(error){
      this.logger.error(`login() : Error : ${error}`)
      throw new BadRequestException(`Error logging in`)
    }
  }

  async register(userData: User) {
    try{
      this.logger.log(`register() : Register user`);
      const user = await this.usersService.findByEmail(userData.email);
      if (user) throw Error(`User exist`);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      return this.usersService.create({ ...userData, password: hashedPassword });
    }catch(error){
      this.logger.error(`register() : Error : ${error}`)
      throw new BadRequestException(`${error}`)
    }
  }
}
