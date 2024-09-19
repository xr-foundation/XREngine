import { ProjectType, projectPath } from '@xrengine/common/src/schemas/projects/project.schema'
import type { Knex } from 'knex'

const routePath = 'route'
const staticResourcePath = 'static-resource'
const avatarPath = 'avatar'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const nameColumnExists = await knex.schema.hasColumn(projectPath, 'name')
  if (nameColumnExists) {
    const projects: ProjectType[] = await knex.select('*').from(projectPath)

    for (const project of projects) {
      if (project.name === 'xrengine/default-project') {
        const newName = 'xrengine/default-project'
        await knex(projectPath).where('id', project.id).update({
          name: newName
        })
        await knex(routePath).where('project', project.name).update({
          project: newName
        })
        await knex(staticResourcePath).where('project', project.name).update({
          project: newName
        })
        await knex(avatarPath).where('project', project.name).update({
          project: newName
        })
      }
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const nameColumnExists = await knex.schema.hasColumn(projectPath, 'name')
  if (nameColumnExists) {
    const projects: ProjectType[] = await knex.select('*').from(projectPath)

    for (const project of projects) {
      if (project.name === 'xrengine/default-project') {
        const newName = 'xrengine/default-project'
        await knex(projectPath).where('id', project.id).update({
          name: newName
        })
        await knex(routePath).where('project', project.name).update({
          project: newName
        })
        await knex(staticResourcePath).where('project', project.name).update({
          project: newName
        })
        await knex(avatarPath).where('project', project.name).update({
          project: newName
        })
      }
    }
  }
}
