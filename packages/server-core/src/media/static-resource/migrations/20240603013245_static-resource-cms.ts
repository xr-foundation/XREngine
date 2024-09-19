
import { locationPath, staticResourcePath } from '@xrengine/common/src/schema.type.module'
import type { Knex } from 'knex'

const assetPath = 'asset'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  // drop unused columns
  const sidColumnExists = await knex.schema.hasColumn(staticResourcePath, 'sid')
  if (sidColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('sid')
    })
  }
  const urlColumnExists = await knex.schema.hasColumn(staticResourcePath, 'url')
  if (urlColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('url')
    })
  }
  const driverColumnExists = await knex.schema.hasColumn(staticResourcePath, 'driver')
  if (driverColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('driver')
    })
  }
  const metdataColumnExists = await knex.schema.hasColumn(staticResourcePath, 'metadata')
  if (metdataColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('metadata')
    })
  }

  // rename column
  const thumbnailTypeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailType')
  if (thumbnailTypeColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.renameColumn('thumbnailType', 'thumbnailMode')
    })
  }
  const thumbnailURLColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailURL')
  if (thumbnailURLColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.renameColumn('thumbnailURL', 'thumbnailKey')
    })
  }

  // add new columns
  const typeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'type')
  if (!typeColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('type', 255).notNullable().defaultTo('file')
    })
  }
  const dependenciesColumnExists = await knex.schema.hasColumn(staticResourcePath, 'dependencies')
  if (!dependenciesColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.text('dependencies').nullable()
    })
  }
  const descriptionColumnExists = await knex.schema.hasColumn(staticResourcePath, 'description')
  if (!descriptionColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.text('description').nullable()
    })
  }

  /** Change location table from storing sceneId as string to ref the scenetable */
  await knex.schema.alterTable(locationPath, (table) => {
    table.dropForeign('sceneId')
    table.foreign('sceneId').references('id').inTable(staticResourcePath).onDelete('CASCADE').onUpdate('CASCADE')
  })

  await knex.schema.dropTable(assetPath)

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  // add back old columns
  const sidColumnExists = await knex.schema.hasColumn(staticResourcePath, 'sid')
  if (!sidColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('sid', 255).notNullable()
    })
  }
  const urlColumnExists = await knex.schema.hasColumn(staticResourcePath, 'url')
  if (!urlColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('url', 255).defaultTo(null)
    })
  }
  const driverColumnExists = await knex.schema.hasColumn(staticResourcePath, 'driver')
  if (!driverColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('driver', 255).nullable()
    })
  }
  const metdataColumnExists = await knex.schema.hasColumn(staticResourcePath, 'metadata')
  if (!metdataColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.json('metadata').defaultTo(null)
    })
  }

  // rename column
  const thumbnailModeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailMode')
  if (thumbnailModeColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.renameColumn('thumbnailMode', 'thumbnailType')
    })
  }
  const thumbnailKeyColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailKey')
  if (thumbnailKeyColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.renameColumn('thumbnailKey', 'thumbnailURL')
    })
  }

  // drop new columns
  const typeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'type')
  if (typeColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('type')
    })
  }
  const dependenciesColumnExists = await knex.schema.hasColumn(staticResourcePath, 'dependencies')
  if (dependenciesColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('dependencies')
    })
  }
  const descriptionColumnExists = await knex.schema.hasColumn(staticResourcePath, 'description')
  if (descriptionColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('description')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
