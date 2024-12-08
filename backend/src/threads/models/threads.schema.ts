import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Forum } from '../../forum/models/forum.schema';
import { User } from '../../user/models/user.schema';
import { Reply } from '../../reply/models/reply.schema';

export type ThreadDocument = HydratedDocument<Thread>;

@Schema({ timestamps: true })
export class Thread {
  @Prop({ required: true })
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Forum', required: true })
  forum: Forum;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  // Store references to Reply documents
  @Prop({ type: [{ replyId: { type: MongooseSchema.Types.ObjectId }, content: String, author: String }], default: [] })
  replies: { replyId: string; content: string; author: string }[];
  
  
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);
