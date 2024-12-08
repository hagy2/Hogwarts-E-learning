import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Thread } from '../../threads/models/threads.schema';

export type ForumDocument = HydratedDocument<Forum>;

@Schema({ timestamps: true })
export class Forum {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  // Store references to threads
  @Prop({
    type: [
      {
        threadId: { type: MongooseSchema.Types.ObjectId, ref: 'Thread' },
        title: String,
        replies: {
          type: [
            {
              replyId: { type: MongooseSchema.Types.ObjectId },
              content: String,
              author: String,
            },
          ],
          default: [],
        },
      },
    ],
    default: [],
  })
  threads: {
    threadId: string;
    title: string;
    replies: { replyId: string; content: string; author: string }[];
  }[];
}

export const ForumSchema = SchemaFactory.createForClass(Forum);
