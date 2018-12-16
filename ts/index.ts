import { StorageBackendPlugin } from 'storex/lib/types/backend'
import { SequelizeStorageBackend } from 'storex-backend-sequelize'
import { alterSchema } from './alter-operation';

export class SchemaEditorSequelizeBackendPlugin extends StorageBackendPlugin<SequelizeStorageBackend> {
    install(backend : SequelizeStorageBackend) {
        backend.registerOperation('alterSchema', async ({operations}) => {
            await alterSchema(backend.sequelize[backend.defaultDatabase], operations)
        })
    }
}
