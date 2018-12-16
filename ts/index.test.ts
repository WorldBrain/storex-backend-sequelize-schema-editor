import * as expect from 'expect'
import StorageManager, { CollectionDefinition } from 'storex'
import { SequelizeStorageBackend } from 'storex-backend-sequelize'
import { collectionToSequelizeModel } from 'storex-backend-sequelize/lib/models'
import { SchemaEditorSequelizeBackendPlugin } from '.';

describe('Sequelize schema editor plugin', () => {
    it('should be able to add tables', async () => {
        const backend = new SequelizeStorageBackend({sequelizeConfig: 'sqlite://'})
        const storageManager = new StorageManager({backend: backend as any})
        storageManager.backend.use(new SchemaEditorSequelizeBackendPlugin() as any)
        await storageManager.finishInitialization()

        const testCollectionDefinition = {
            version: new Date(2018, 12, 12),
            fields: {
                id: { type: 'auto-pk' },
                foo: { type: 'string' },
            },
            indices: [],
        }
        await storageManager.backend.operation('alterSchema', {operations: [
            {type: 'addCollection', collection: 'test', definition: testCollectionDefinition as CollectionDefinition}
        ]})
        const testSequelizeModel = backend.sequelize['default'].define(
            'test', collectionToSequelizeModel({definition: testCollectionDefinition as CollectionDefinition}),
            {timestamps: false}
        )
        const created = await testSequelizeModel.create({foo: 'bla'})
        const found = await testSequelizeModel.findAll({where: {foo: 'bla'}})
        expect(found).toEqual([expect.objectContaining({id: 1, foo: 'bla'})])
    })
})
