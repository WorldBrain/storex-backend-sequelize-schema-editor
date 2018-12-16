import { Sequelize } from "sequelize"
import { CollectionDefinition } from "storex"
import { pluralize } from "storex/lib/utils"
import { collectionToSequelizeModel } from "storex-backend-sequelize/lib/models"

export async function alterSchema(sequelize : Sequelize, operations : any[]) {
    for (const operation of operations) {
        await _OPERATIONS[operation.type]({sequelize, ...operation})
    }
}

export async function _addCollection(
    {sequelize, collection, definition} : 
    {sequelize : Sequelize, collection : string, definition : CollectionDefinition})
{
    await sequelize.getQueryInterface().createTable(pluralize(collection), collectionToSequelizeModel({definition}))
}

export const _OPERATIONS = {
    addCollection: _addCollection,
}