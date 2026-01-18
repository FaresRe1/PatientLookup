import type { RxJsonSchema } from 'rxdb';
import type { ClientResponseType } from '~/models/client';

// RxDB stores date-like fields as ISO strings in JSON; reuse central model types
export type Client = Omit<ClientResponseType, 'dob' | 'createdAt' | 'updatedAt' | 'lastModified'> & {
  dob: string | null;
  createdAt: string;
  updatedAt: string;
  lastModified?: string | null;
  deletedAt?: string | null;
};

export const clientSchema: RxJsonSchema<Client> = {
  title: 'Client schema',
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string' },
    fullName: { type: 'string' },
    gender: { type: 'string' },
    dob: { type: 'string', format: 'date-time' },
    email: { type: ['string', 'null'] },
    phoneNumber: { type: ['string', 'null'] },
    address: { type: ['string', 'null'] },
    profileImage: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    lastModified: { type: ['string', 'null'], format: 'date-time' },
    deletedAt: { type: ['string', 'null'], format: 'date-time' },
    revision: { type: 'integer' },
  },
  required: ['id', 'fullName', 'gender', 'dob', 'createdAt', 'updatedAt', 'revision'],
  indexes: ['fullName', 'updatedAt'],
};