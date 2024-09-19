

import { BufferGeometry, Group, Material } from "three";
import { Loader } from "../base/Loader";

export class USDAParser {
    parse(text: string): object
}

export class USDZLoader extends Loader {
    register(plugin: USDZLoaderPlugin): void
    unregister(plugin: USDZLoaderPlugin): void
    load(url: string, onLoad: (result) => void, onProgress?: (progress) => void, onError?: (error) => void, signal?: AbortSignal): void
    parse(buffer: string, onLoad: (result) => void): object
}

export interface USDZLoaderPlugin {
    buildMesh?: ((mesh: Mesh<BufferGeometry, any>, data: any) => Mesh<BufferGeometry, any>)
    buildGeometry?: ((geo: BufferGeometry, data: any) => BufferGeometry)
    buildMaterial?: ((material: Material, data: any) => Material)
    buildXform?: ((xform: Group, data: any) => Group)
}