import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
  @Prop({
    required: true,
    index: true,
  })
  offer: string;

  @Prop({ required: true, index: true })
  user: string;

  @Prop()
  content: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
