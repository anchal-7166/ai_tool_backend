export interface IRepository<T> {
  findAll(params?: any): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findOne(where: any): Promise<T | null>;
  create(data: any): Promise<T>;
  createMany(data: any[]): Promise<{ count: number }>;
  update(id: string, data: any): Promise<T>;
  updateMany(where: any, data: any): Promise<{ count: number }>;
  delete(id: string): Promise<T>;
  deleteMany(where: any): Promise<{ count: number }>;
}