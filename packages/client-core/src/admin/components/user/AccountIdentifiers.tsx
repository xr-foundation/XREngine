
import React from 'react'
import { MdEmail } from 'react-icons/md'
import {
  RiAppleFill,
  RiDiscordFill,
  RiGithubFill,
  RiGoogleFill,
  RiLinkedinFill,
  RiMessage2Line,
  RiMetaFill,
  RiTwitterXFill
} from 'react-icons/ri'

import { IdentityProviderType, UserType } from '@xrengine/common/src/schema.type.module'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'

export default function AccountIdentifiers({ user }: { user: UserType }) {
  const appleIp = user.identityProviders.find((ip) => ip.type === 'apple')
  const discordIp = user.identityProviders.find((ip) => ip.type === 'discord')
  const googleIp = user.identityProviders.find((ip) => ip.type === 'google')
  const facebookIp = user.identityProviders.find((ip) => ip.type === 'facebook')
  const twitterIp = user.identityProviders.find((ip) => ip.type === 'twitter')
  const linkedinIp = user.identityProviders.find((ip) => ip.type === 'linkedin')
  const githubIp = user.identityProviders.find((ip) => ip.type === 'github')
  const emailIp = user.identityProviders.find((ip) => ip.type === 'email')
  const smsIp = user.identityProviders.find((ip) => ip.type === 'sms')

  const getAccountIdentifierTitle = (ip: IdentityProviderType) => {
    return (
      <div className="flex flex-col justify-center">
        <Text className="text-center">{ip.accountIdentifier!}</Text>
        {ip.email && <Text>{`(${ip.email})`}</Text>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {appleIp ? (
        <Tooltip content={getAccountIdentifierTitle(appleIp)}>
          <RiAppleFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {discordIp ? (
        <Tooltip content={getAccountIdentifierTitle(discordIp)}>
          <RiDiscordFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {googleIp ? (
        <Tooltip content={getAccountIdentifierTitle(googleIp)}>
          <RiGoogleFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {facebookIp ? (
        <Tooltip content={getAccountIdentifierTitle(facebookIp)}>
          <RiMetaFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {twitterIp ? (
        <Tooltip content={getAccountIdentifierTitle(twitterIp)}>
          <RiTwitterXFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {linkedinIp ? (
        <Tooltip content={getAccountIdentifierTitle(linkedinIp)}>
          <RiLinkedinFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {githubIp ? (
        <Tooltip content={getAccountIdentifierTitle(githubIp)}>
          <RiGithubFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {smsIp ? (
        <Tooltip content={getAccountIdentifierTitle(smsIp)}>
          <RiMessage2Line className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {emailIp ? (
        <Tooltip content={getAccountIdentifierTitle(emailIp)}>
          <MdEmail className="h-6 w-6" />
        </Tooltip>
      ) : null}
    </div>
  )
}
