import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Contact } from './entity/contact.entity';
import { User } from '../user/entity/user.entity';
import { Constants } from 'src/shared/constants';


@Injectable()
export class ContactsService {
    private readonly logger = new Logger(ContactsService.name)
    constructor(@InjectRepository(Contact) private repo: Repository<Contact>) { }

    async create(contactData: Contact, user: User) {
        this.logger.log(`create() : Create contact`)
        try {
            const result = this.repo.createQueryBuilder()
                .insert()
                .into(Contact)
                .values({
                    name: contactData.name,
                    email: contactData.email,
                    phone: contactData.phone,
                    userId: user.id,
                    photoUrl: contactData.photoUrl
                })
                .returning('*')
                .execute();
            return result;
        } catch (err) {
            this.logger.error(`create() : Error creating contact - ${err}`)
            throw new BadRequestException('Failed to create contact');;
        }
    }

    async findAll(user: User, selectedUserId: string, page: number, limit: number, search: string, sortBy: string, order: string) {
        try {
            this.logger.log(`findAll() : Fetch all contacts`)
            const query = this.repo.createQueryBuilder('contact');
            if (user.role !== Constants.ADMIN) {
                query.where('contact.userId = :userId', { userId: user.id });
            } else {
                query.where('contact.userId = :userId', { userId: selectedUserId });
            }
            if (search) {
                query.andWhere('(contact.name ILIKE :search OR contact.email ILIKE :search)', { search: `%${search}%` });
            }

            query.orderBy(`contact.${sortBy}`, order as 'ASC' | 'DESC');

            // Pagination
            query.skip((page - 1) * limit).take(limit);

            // Execute
            const [data, total] = await query.getManyAndCount();
            return { data, total };
        } catch (error) {
            this.logger.error(`findAll() : Error fetching all contacts - ${error}`)
            throw new BadRequestException('Failed to fetch contacts');
        }
    }

    async findOne(id: string, user: User) {
        try {
            this.logger.log(`findOne() : Fetch all contacts`)
            if (user.role == Constants.ADMIN) {
                const contact = await this.repo.findOne({ where: { id } });
                if (!contact) throw new NotFoundException('Contact not found');
                return contact;
            } else {
                const contact = await this.repo.findOne({ where: { id, userId: user.id } });
                if (!contact) throw new NotFoundException('Contact not found');
                return contact;
            }
        } catch (error) {
            this.logger.error(`findOne() : Error - ${error}`)
            throw new BadRequestException('Failed to find contact');
        }


    }

    async update(id: string, updateData: Contact) {
        try {
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
        } catch (error) {
            this.logger.error(`update() : Error - ${error}`)
            throw new BadRequestException('Failed to update contact');
        }

    }

    async remove(id: string, user: User) {
        try {
            const contact = await this.findOne(id, user);
            return this.repo.remove(contact);
        } catch (error) {
            this.logger.error(`remove() : Error - ${error}`)
            throw new BadRequestException('Failed to delete contact');
        }
    }
}
