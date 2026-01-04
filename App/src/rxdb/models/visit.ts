import type { RxJsonSchema } from 'rxdb';
import type { VisitResponseType } from '~/models/visit';

export type FormResponse = {
  templateId: string;
  templateName: string;
  answers: Record<string, any>;
};

export type Visit = Omit<VisitResponseType, 'visitDate' | 'createdAt'> & {
  visitDate: string;
  createdAt: string;
  forms?: FormResponse[];
};

export const visitSchema: RxJsonSchema<Visit> = {
  title: 'Visit/Report Schema',
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    clientId: { 
        type: 'string',
        ref: 'clients'
    },
    doctorName: { type: 'string' },
    visitDate: { type: 'string', format: 'date-time' },
    notes: { type: ['string', 'null'] },
    forms: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          templateId: { type: 'string' },
          templateName: { type: 'string' },
          answers: { 
            type: 'object' // This stores the dynamic JSON answers
          }
        }
      }
    },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'clientId', 'doctorName', 'visitDate', 'createdAt'],
  indexes: [
      'visitDate', // Useful for sorting most recent visits
      'clientId'   // Used to get all visits for patient
  ] 
};