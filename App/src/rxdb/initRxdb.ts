import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { clientSchema } from './models/client';
import { visitSchema } from './models/visit';

// Plugins (v15 style)
import replicationPlugin from 'rxdb/plugins/replication';
import updatePlugin from 'rxdb/plugins/update';

// Register plugins
addRxPlugin(replicationPlugin as any);
addRxPlugin(updatePlugin as any);


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
    visits: { schema: visitSchema },
  });

  return db;
}