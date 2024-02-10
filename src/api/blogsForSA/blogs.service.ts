import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogClass, BlogDocument } from '../../schema/blogs.schema';
import { BlogsRepository } from './blogs.repository';

export class BlogsServiceForSA {
  constructor(
    @InjectModel(BlogClass.name) private blogModel: Model<BlogDocument>,
    protected blogsRepository: BlogsRepository,
  ) {}
}
