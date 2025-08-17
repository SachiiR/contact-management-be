import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Contact } from './entity/contact.entity';
import { User } from '../user/entity/user.entity';


@Injectable()
export class ContactsService {
    constructor(@InjectRepository(Contact) private repo: Repository<Contact>) { }

    async create(contactData: Contact, user: User) {
        try {
            const result = this.repo.createQueryBuilder()
                .insert()
                .into(Contact)
                .values({
                    name: contactData.name,
                    email: contactData.email,
                    phone: contactData.phone,
                    userId: user.id, // Reference user by ID
                    photoUrl: contactData.photoUrl
                })
                .returning('*')
                .execute();
            return result;
        } catch (err) {
            console.error('Error saving contact:', err);
            throw err;
        }
    }

    async findAll(user: User, page: number, limit: number, search?: string) {
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
        const query = this.repo.createQueryBuilder('contact');
        if (user.role !== 'admin') {
            query.where('contact.userId = :userId', { userId: user.id });
        }
        if (search) {
            query.andWhere('(contact.name ILIKE :search OR contact.email ILIKE :search)', { search: `%${search}%` });
        }
        //   query.orderBy(`contact.${sortBy}`, sortOrder as 'ASC' | 'DESC');
        query.skip((page - 1) * limit).take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async findOne(id: string, user: User) {
        if (user.role == 'admin') {
            const contact = await this.repo.findOne({ where: { id } });
            if (!contact) throw new NotFoundException('Contact not found');
            return contact;
        } else {
            const contact = await this.repo.findOne({ where: { id, userId: user.id } });
            if (!contact) throw new NotFoundException('Contact not found');
            return contact;
        }

    }

    async update(id: string, updateData: Contact) {
        console.log('ddsadsadsad', updateData)
        const result = await this.repo
            .createQueryBuilder()
            .update(Contact)
            .set(updateData)
            .where('id = :id', { id }) // ensure the contact belongs to the user
            .returning('*') // optional: return the updated row
            .execute();

        if (result.affected === 0) {
            throw new Error('Contact not found or unauthorized');
        }

        return result.raw[0];
    }

    async remove(id: string, user: User) {
        const contact = await this.findOne(id, user);
        return this.repo.remove(contact);
    }
}
