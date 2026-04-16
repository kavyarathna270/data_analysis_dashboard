import mongoose, { Schema, Document } from 'mongoose'

export interface IEvent extends Document {
  projectId: string
  eventType: string
  page: string
  userId?: string
  sessionId: string
  metadata: Record<string, any>
  timestamp: Date
}

const EventSchema = new Schema<IEvent>({
  projectId:  { type: String, required: true, index: true },
  eventType:  { type: String, required: true },  // e.g. 'page_view', 'click'
  page:       { type: String, required: true },
  userId:     { type: String },
  sessionId:  { type: String, required: true },
  metadata:   { type: Schema.Types.Mixed, default: {} },
  timestamp:  { type: Date, default: Date.now, index: true },
})

export const Event = mongoose.model<IEvent>('Event', EventSchema)