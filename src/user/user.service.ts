import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';


@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) { }

  create(userData: Partial<User>) {
    const user = this.repo.create(userData);
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(user: any, page: number, limit: number, search?: string) {
    console.log(user, 'USER');
    console.log(search, 'SEARCH');
    // if (user.role == 'admin') {
    //     return this.repo.find({
    //         where: { name: search ? Like(`%${search}%`) : undefined, email: search ? Like(`%${search}%`) : undefined },
    //         order: { createdAt: 'ASC' },
    //     });
    // } else {
    //     return this.repo.find({
    //         where: { userId: user.userId, name: search ? Like(`%${search}%`) : undefined, email: search ? Like(`%${search}%`) : undefined },
    //         order: { createdAt: 'ASC' },
    //     });
    // }
    const query = this.repo.createQueryBuilder('user');

    query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });

    //   query.orderBy(`contact.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }
}
