export const CREDENTIAL_OFFSET = 60 * 10
//coturn requires the password be hashed via SHA1, tried SHA256 and it didn't work
export const HASH_ALGORITHM = 'sha1'

export const defaultIceServer = {
  urls: [],
  useFixedCredentials: false,
  useTimeLimitedCredentials: false
}

export const defaultWebRTCSettings = {
  iceServers: [],
  useCustomICEServers: false,
  usePrivateInstanceserverIP: false
}
