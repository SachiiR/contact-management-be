import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Contact } from './entity/contact.entity';
import { User } from '../users/entity/user.entity';


@Injectable()
export class ContactsService {
    constructor(@InjectRepository(Contact) private repo: Repository<Contact>) { }

    async create(contactData: Contact, user: any) {
        try {
            const result = this.repo.createQueryBuilder()
                .insert()
                .into(Contact)
                .values({
                    name: contactData.name,
                    email: contactData.email,
                    phone: contactData.phone,
                    userId: user.userId, // Reference user by ID
                    photoUrl: user.photoUrl
                })
                .returning('*')
                .execute();
            return result;
        } catch (err) {
            console.error('Error saving contact:', err);
            throw err;
        }
    }

    async findAll(user: any, search?: string) {
        if (user.role == 'admin') {
            return this.repo.find({
                where: { name: search ? Like(`%${search}%`) : undefined, email: search ? Like(`%${search}%`) : undefined },
                order: { createdAt: 'ASC' },
            });
        } else {
            return this.repo.find({
                where: { userId: user.userId, name: search ? Like(`%${search}%`) : undefined, email: search ? Like(`%${search}%`) : undefined },
                order: { createdAt: 'ASC' },
            });
        }
    }

    async findOne(id: string, user: any) {
        if (user.role == 'admin') {
            const contact = await this.repo.findOne({ where: { id } });
            if (!contact) throw new NotFoundException('Contact not found');
            return contact;
        } else {
            const contact = await this.repo.findOne({ where: { id, userId: user.userId } });
            if (!contact) throw new NotFoundException('Contact not found');
            return contact;
        }

    }

    async update(id: string, updateData: any, user: any) {
        const result = await this.repo
            .createQueryBuilder()
            .update(Contact)
            .set(updateData)
            .where('id = :id AND "userId" = :userId', { id, userId: user.userId }) // ensure the contact belongs to the user
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
