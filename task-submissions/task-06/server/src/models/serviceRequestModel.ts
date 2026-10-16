import { Schema, model, type Types } from 'mongoose';
import { CATEGORIES, PRIORITIES, STATUSES, type RequestFields } from '../types/serviceRequest';

export interface ServiceRequestDocument extends RequestFields {
  createdAt: Date;
  updatedAt: Date;
}

/** Shape of a document returned by `.lean()`. */
export type StoredServiceRequest = ServiceRequestDocument & { _id: Types.ObjectId };

const serviceRequestSchema = new Schema<ServiceRequestDocument>(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    category: { type: String, required: true, enum: [...CATEGORIES] },
    priority: { type: String, required: true, enum: [...PRIORITIES], default: 'medium' },
    status: { type: String, required: true, enum: [...STATUSES], default: 'open' },
    requesterName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    requesterEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  },
  { timestamps: true, collection: 'serviceRequests' },
);

serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ status: 1, priority: 1, category: 1 });

export const ServiceRequestModel = model<ServiceRequestDocument>(
  'ServiceRequest',
  serviceRequestSchema,
);
