
import type { Knex } from 'knex'

import { clientSettingPath } from '@xrengine/common/src/schemas/setting/client-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const siteManifest = await knex.schema.hasColumn(clientSettingPath, 'siteManifest')
  if (!siteManifest) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.string('siteManifest', 255).nullable()
    })
  }
  const safariPinnedTab = await knex.schema.hasColumn(clientSettingPath, 'safariPinnedTab')
  if (!safariPinnedTab) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.string('safariPinnedTab', 255).nullable()
    })
  }
  const favicon = await knex.schema.hasColumn(clientSettingPath, 'favicon')
  if (!favicon) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.string('favicon', 255).nullable()
    })
  }
  const clientSetting = await knex.table(clientSettingPath).first()
  if (clientSetting) {
    await knex.table(clientSettingPath).update({
      siteDescription: 'XREngine',
      appTitle: 'static/xrengine-logo.svg',
      appSubtitle: 'XREngine',
      siteManifest: '/site.webmanifest',
      safariPinnedTab: '/safari-pinned-tab.svg',
      favicon: '/favicon.ico'
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const siteManifest = await knex.schema.hasColumn(clientSettingPath, 'siteManifest')
  if (siteManifest) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.dropColumn('siteManifest')
    })
  }
  const safariPinnedTab = await knex.schema.hasColumn(clientSettingPath, 'safariPinnedTab')
  if (safariPinnedTab) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.dropColumn('safariPinnedTab')
    })
  }
  const favicon = await knex.schema.hasColumn(clientSettingPath, 'favicon')
  if (favicon) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.dropColumn('favicon')
    })
  }
  const clientSetting = await knex.table(clientSettingPath).first()
  if (clientSetting)
    await knex.table(clientSettingPath).update({
      siteDescription: 'XREngine',
      appTitle: 'static/xrengine_watermark_small.png',
      appSubtitle: 'XREngine'
    })
}
