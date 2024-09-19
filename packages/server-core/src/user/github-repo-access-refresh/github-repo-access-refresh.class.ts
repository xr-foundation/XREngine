
import { Paginated, ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import {
  githubRepoAccessPath,
  GithubRepoAccessType
} from '@xrengine/common/src/schemas/user/github-repo-access.schema'
import { identityProviderPath, IdentityProviderType } from '@xrengine/common/src/schemas/user/identity-provider.schema'
import * as k8s from '@kubernetes/client-node'

import { UserID } from '@xrengine/common/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import { getJobBody } from '../../k8s-job-helper'
import { getUserRepos } from '../../projects/project/github-helper'
import logger from '../../ServerLogger'

export interface GithubRepoAccessRefreshParams extends KnexAdapterParams {}

export async function getGithubRepoAccessRefreshJobBody(
  app: Application,
  jobId: string,
  userId: UserID
): Promise<k8s.V1Job> {
  const command = [
    'npx',
    'cross-env',
    'ts-node',
    '--swc',
    'scripts/refresh-gh-repo-access.ts',
    '--userId',
    userId,
    '--jobId',
    jobId
  ]

  const labels = {
    'xrengine/ghRepoAccessRefresh': 'true',
    'xrengine/autoUpdate': 'false',
    'xrengine/userId': userId,
    'xrengine/release': process.env.RELEASE_NAME!
  }

  const name = `${process.env.RELEASE_NAME}-gh-repo-refresh-${userId.slice(0, 8)}-update`

  return getJobBody(app, command, name, labels)
}

/**
 * A class for Github Repo Access Refresh service
 */
export class GithubRepoAccessRefreshService implements ServiceInterface<void, GithubRepoAccessRefreshParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: GithubRepoAccessRefreshParams) {
    try {
      const githubIdentityProvider = (await this.app.service(identityProviderPath).find({
        query: {
          userId: params?.user!.id,
          type: 'github',
          $limit: 1
        }
      })) as Paginated<IdentityProviderType>

      if (githubIdentityProvider.data.length > 0) {
        const existingGithubRepoAccesses = (await this.app.service(githubRepoAccessPath).find({
          query: {
            identityProviderId: githubIdentityProvider.data[0].id
          },
          paginate: false
        })) as any as GithubRepoAccessType[]

        const githubRepos = await getUserRepos(githubIdentityProvider.data[0].oauthToken!, this.app)
        await Promise.all(
          githubRepos.map(async (repo) => {
            const matchingAccess = existingGithubRepoAccesses.find((access) => access.repo === repo.html_url)
            const hasWriteAccess = repo.permissions.admin || repo.permissions.maintain || repo.permissions.push
            if (!matchingAccess)
              await this.app.service(githubRepoAccessPath).create({
                repo: repo.html_url,
                identityProviderId: githubIdentityProvider.data[0].id,
                hasWriteAccess
              })
            else
              await this.app.service(githubRepoAccessPath).patch(matchingAccess.id, {
                hasWriteAccess
              })
          })
        )
        const urlsOnly = githubRepos.map((repo) => repo.html_url)
        await Promise.all(
          existingGithubRepoAccesses.map(async (repoAccess) => {
            if (urlsOnly.indexOf(repoAccess.repo) < 0)
              await this.app.service(githubRepoAccessPath).remove(repoAccess.id)
          })
        )
      }
      return
    } catch (err) {
      logger.error(err)
      throw err
    }
  }
}
