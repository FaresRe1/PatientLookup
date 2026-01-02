import type { RxJsonSchema } from 'rxdb';

export interface FormResponse {
  templateId: string;   
  templateName: string;
  answers: Record<string, any>; 
}

export interface Visit {
  id: string;
  clientId: string; // (Foreign Key)
  doctorName: string;    
  visitDate: string;    
  notes: string;        
  

  forms: FormResponse[]; 
  
  createdAt: string;
  updatedAt: string;
}

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
    notes: { type: 'string' },
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
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'clientId', 'doctorName', 'visitDate', 'createdAt'],
  indexes: [
      'visitDate', // Useful for sorting most recent visits
      'clientId'   // Used to get all visits for patient
  ] 
};