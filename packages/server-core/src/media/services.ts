import FileBrowserUpload from './file-browser-upload/file-browser-upload'
import FileBrowser from './file-browser/file-browser'
import Invalidation from './invalidation/invalidation'
import OEmbed from './oembed/oembed'
import Archiver from './recursive-archiver/archiver'
import StaticResource from './static-resource/static-resource'
import Upload from './upload-asset/upload-asset.service'

export default [Invalidation, StaticResource, FileBrowser, FileBrowserUpload, OEmbed, Upload, Archiver]
