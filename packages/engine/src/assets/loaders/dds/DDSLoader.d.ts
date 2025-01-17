


//https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/three/examples/jsm/loaders/DDSLoader.d.ts
import { LoadingManager, CompressedTextureLoader, PixelFormat, CompressedPixelFormat } from 'three';

export interface DDS {
    mipmaps: object[];
    width: number;
    height: number;
    format: PixelFormat | CompressedPixelFormat;
    mipmapCount: number;
    isCubemap: boolean;
}

export class DDSLoader extends CompressedTextureLoader {
    constructor(manager?: LoadingManager);

    parse(buffer: ArrayBuffer, loadMipmaps: boolean): DDS;
}