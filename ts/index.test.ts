import * as expect from 'expect'
import StorageManager, { CollectionDefinition } from 'storex'
import { SequelizeStorageBackend } from 'storex-backend-sequelize'
import { collectionToSequelizeModel } from 'storex-backend-sequelize/lib/models'
import { SchemaEditorSequelizeBackendPlugin } from '.';

const TEST_COLLECTION_DEFINITION = {
    version: new Date(2018, 12, 12),
    fields: {
        id: { type: 'auto-pk' },
        foo: { type: 'string' },
    },
    indices: [],
} as CollectionDefinition

describe('Sequelize schema editor plugin', () => {
    it('should be able to add tables', async () => {
        const backend = new SequelizeStorageBackend({sequelizeConfig: 'sqlite://'})
        const storageManager = new StorageManager({backend: backend as any})
        storageManager.backend.use(new SchemaEditorSequelizeBackendPlugin() as any)
        await storageManager.finishInitialization()

        await storageManager.backend.operation('alterSchema', {operations: [
            {type: 'addCollection', collection: 'test', definition: TEST_COLLECTION_DEFINITION}
        ]})
        const testSequelizeModel = backend.sequelize['default'].define(
            'test', collectionToSequelizeModel({definition: TEST_COLLECTION_DEFINITION}),
            {timestamps: false}
        )
        await testSequelizeModel.create({foo: 'bla'})
        const found = await testSequelizeModel.findAll({where: {foo: 'bla'}})
        expect(found).toEqual([expect.objectContaining({id: 1, foo: 'bla'})])
    })

    it('should be able to add fields', async () => {
        const backend = new SequelizeStorageBackend({sequelizeConfig: 'sqlite://'})
        const storageManager = new StorageManager({backend: backend as any})
        storageManager.backend.use(new SchemaEditorSequelizeBackendPlugin() as any)
        storageManager.registry.registerCollection('test', TEST_COLLECTION_DEFINITION)
        await storageManager.finishInitialization()
        await storageManager.backend.migrate()
        
        await storageManager.backend.operation('alterSchema', {operations: [
            {type: 'addField', collection: 'test', field: 'bar', definition: {type: 'string'}}
        ]})
        const testSequelizeModel = backend.sequelize['default'].define(
            'test', collectionToSequelizeModel({definition: {
                ...TEST_COLLECTION_DEFINITION,
                fields: {
                    ...TEST_COLLECTION_DEFINITION.fields,
                    bar: {type: 'string'},
                }
            } as CollectionDefinition}),
            {timestamps: false}
        )
        await testSequelizeModel.create({foo: 'bla', bar: 'spam'})
        const found = await testSequelizeModel.findAll({where: {foo: 'bla'}})
        expect(found).toEqual([expect.objectContaining({id: 1, foo: 'bla', bar: 'spam'})])
    })

    it('should be able to remove fields', async () => {
        const backend = new SequelizeStorageBackend({sequelizeConfig: 'sqlite://'})
        const storageManager = new StorageManager({backend: backend as any})
        storageManager.backend.use(new SchemaEditorSequelizeBackendPlugin() as any)
        storageManager.registry.registerCollection('test', TEST_COLLECTION_DEFINITION)
        await storageManager.finishInitialization()
        await storageManager.backend.migrate()
        
        await storageManager.backend.operation('alterSchema', {operations: [
            {type: 'removeField', collection: 'test', field: 'foo'}
        ]})
        const testSequelizeModel = backend.sequelize['default'].define(
            'test', collectionToSequelizeModel({definition: TEST_COLLECTION_DEFINITION}),
            {timestamps: false}
        )
        await expect(testSequelizeModel.create({foo: 'bla'})).rejects.toThrow('SQLITE_ERROR: table tests has no column named foo')
    })
})
