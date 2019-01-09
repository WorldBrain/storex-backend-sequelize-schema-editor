import { Sequelize } from "sequelize"
import { CollectionDefinition, CollectionField } from "storex"
import { pluralize } from "storex/lib/utils"
import { collectionToSequelizeModel, fieldToSequelizeField } from "storex-backend-sequelize/lib/models"

export async function alterSchema(sequelize : Sequelize, operations : any[]) {
    for (const operation of operations) {
        if (!_OPERATIONS[operation.type]) {
            throw new Error(`Unknown alterSchema operation: ${operation.type}`)
        }
    }
    for (const operation of operations) {
        await _OPERATIONS[operation.type]({sequelize, ...operation})
    }
}

export async function addCollection(
    {sequelize, collection, definition} : 
    {sequelize : Sequelize, collection : string, definition : CollectionDefinition})
{
    await sequelize.getQueryInterface().createTable(pluralize(collection), collectionToSequelizeModel({definition}))
}

export async function prepareAddField(
    {sequelize, collection, field, definition} : 
    {sequelize : Sequelize, collection : string, field : string, definition : CollectionField})
{
    await sequelize.getQueryInterface().addColumn(pluralize(collection), field, fieldToSequelizeField({
        ...definition,
        optional: true
    }))
}

export async function finalizeAddField(
    {sequelize, collection, field, definition} : 
    {sequelize : Sequelize, collection : string, field : string, definition : CollectionField})
{
    if (definition.optional) {
        return
    }

    await sequelize.getQueryInterface().changeColumn(pluralize(collection), field, fieldToSequelizeField({
        ...definition,
        optional: false
    }))
}

export async function removeField(
    {sequelize, collection, field} : 
    {sequelize : Sequelize, collection : string, field : string})
{
    await sequelize.getQueryInterface().removeColumn(pluralize(collection), field)
}

export const _OPERATIONS = {
    addCollection,
    prepareAddField,
    finalizeAddField,
    removeField,
}
