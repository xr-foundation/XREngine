import { GLTFParser } from '../GLTFParser'

export class ImporterExtension {
  name: string
  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }
}
