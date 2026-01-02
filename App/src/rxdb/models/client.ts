import type { RxJsonSchema } from 'rxdb';

export interface Client {
  id: string;
  fullName: string;
  dob: string;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  revision: number;
}

export const clientSchema: RxJsonSchema<Client> = {
  title: 'Client schema',
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string' },
    fullName: { type: 'string' },
    dob: { type: 'string', format: 'date-time' },
    email: { type: ['string', 'null'] },
    phoneNumber: { type: ['string', 'null'] },
    address: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: ['string', 'null'], format: 'date-time' },
    revision: { type: 'integer' },
  },
  required: ['id', 'fullName', 'createdAt', 'updatedAt', 'revision'],
  indexes: ['fullName', 'updatedAt'],
};
