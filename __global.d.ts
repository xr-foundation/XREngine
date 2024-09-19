

/// <reference types="vite-plugin-svgr/client" />


/* eslint-disable no-unused-vars */
declare module '*.jpg'
declare module '*.png'
declare module '*.svg'
declare module '*.scss'
declare module '*.scss?inline'
declare module '*.css'
declare module '*.json'
declare module '*.wav'
declare module '*.glb'
declare module '*.frag'
declare module '*.vert'

declare interface Element {
  setAttribute(qualifiedName: string, value: object): void
}

declare type CbFunction = (this: { el: HTMLElement; [key: string]: any }) => void

declare module '*.glb!text' {
  const value: string
  export default value
}

declare module '*.frag!text' {
  const value: string
  export default value
}

declare module '*.vert!text' {
  const value: string
  export default value
}

declare module '*!text' {
  const _: string
  export default _
}
