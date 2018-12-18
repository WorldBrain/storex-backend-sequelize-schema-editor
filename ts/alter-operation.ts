import { Sequelize } from "sequelize"
import { CollectionDefinition, CollectionField } from "storex"
import { pluralize } from "storex/lib/utils"
import { collectionToSequelizeModel, fieldToSequelizeField } from "storex-backend-sequelize/lib/models"

export async function alterSchema(sequelize : Sequelize, operations : any[]) {
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

export async function addField(
    {sequelize, collection, field, definition} : 
    {sequelize : Sequelize, collection : string, field : string, definition : CollectionField})
{
    await sequelize.getQueryInterface().addColumn(pluralize(collection), field, fieldToSequelizeField(definition))
}

export async function removeField(
    {sequelize, collection, field} : 
    {sequelize : Sequelize, collection : string, field : string})
{
    await sequelize.getQueryInterface().removeColumn(pluralize(collection), field)
}

export const _OPERATIONS = {
    addCollection,
    addField,
    removeField,
}
