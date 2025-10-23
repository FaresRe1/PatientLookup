import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import type { RxJsonSchema } from 'rxdb';

// Plugins (v15 style)
import replicationPlugin from 'rxdb/plugins/replication';
import updatePlugin from 'rxdb/plugins/update';

// Register plugins
addRxPlugin(replicationPlugin as any);
addRxPlugin(updatePlugin as any);

// Document interface
interface Client {
  id: string;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  lastModified: string;
  revision: number;
}

// Client schema
export const clientSchema: RxJsonSchema<Client> = {
  title: 'Client schema',
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string' },
    fullName: { type: 'string' },
    email: { type: ['string', 'null'] },
    phoneNumber: { type: ['string', 'null'] },
    address: { type: ['string', 'null'] },
    notes: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: ['string', 'null'], format: 'date-time' },
    lastModified: { type: 'string', format: 'date-time' },
    revision: { type: 'integer' },
  },
  required: ['id', 'fullName', 'createdAt', 'updatedAt', 'lastModified', 'revision'],
  indexes: ['fullName', 'updatedAt'],
};

// Initialize database
export async function initRxDB() {
  const db = await createRxDatabase({
    name: 'localdb',
    storage: getRxStorageDexie(),
    multiInstance: true,
    eventReduce: true,
  });

  await db.addCollections({
    clients: { schema: clientSchema },
  });

  return db;
}