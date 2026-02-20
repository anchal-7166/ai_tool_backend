import { Injectable, NotFoundException } from '@nestjs/common';
import { IRepository } from '../base-interface/base-interface';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export abstract class BaseRepository<T> implements IRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly modelName: string,
  ) {}

  // Dynamically access the correct Prisma model
  // 'tool' → prisma.tool | 'user' → prisma.user | 'category' → prisma.category
  private get model(): any {
    return this.prisma[this.modelName];
  }

  
  async create(data: any): Promise<T> {
     console.log(data,".........................",this.modelName)
    return this.model.create({ data });
  }

  async createMany(data: any[]): Promise<{ count: number }> {
    return this.model.createMany({ data, skipDuplicates: true });
  }

  async findAll(params?: any): Promise<T[]> {
    return this.model.findMany(params ?? {});
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findOne(where: any): Promise<T | null> {
    return this.model.findFirst({ where });
  }


  async update(id: string, data: any): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return this.model.updateMany({ where, data });
  }


  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return this.model.deleteMany({ where });
  }
}