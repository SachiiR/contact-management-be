import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';


@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)
  constructor(@InjectRepository(User) private repo: Repository<User>) { }

  create(userData: Partial<User>) {
    try {
      this.logger.log('create() : init')
      const user = this.repo.create(userData);
      return this.repo.save(user);
    } catch (error) {
      this.logger.error(`create() : Error ${error}`)
      throw new BadRequestException('User creation failed')
    }
  }

  findByEmail(email: string) {
    try {
      this.logger.log('findByEmail() : init')
      return this.repo.findOne({ where: { email } });
    } catch (error) {
      this.logger.error(`findByEmail() : Error ${error}`)
      throw new BadRequestException('Failed to get user by email')
    }

  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(user: any, page: number, limit: number, search?: string) {
    this.logger.log('findall() : init')
    try {
      const query = this.repo.createQueryBuilder('user');
      query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
      query.skip((page - 1) * limit).take(limit);

      const [data, total] = await query.getManyAndCount();
      return { data, total };
    } catch (error) {
      this.logger.error('Error fetching users', error.stack);
      throw new BadRequestException('Failed to fetch users');
    }

  }

  async update(id: string, updateData: User) {
    this.logger.log('update() : init')
    try {
      const result = await this.repo
        .createQueryBuilder()
        .update(User)
        .set(updateData)
        .where('id = :id', { id })
        .returning('*')
        .execute();

      if (result.affected === 0) {
        this.logger.log('update() : Contact not found or unauthorized')
      }
      return result.raw[0];
    } catch (error) {
      this.logger.error('Error fupdating user', error.stack);
      throw new Error('Failed to update user');
    }

  }
}
