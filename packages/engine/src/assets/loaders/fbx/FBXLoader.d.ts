

import { Group, LoadingManager } from 'three'
import { Loader } from '../base/Loader'

export class FBXLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad: (object: Group) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
        signal?: AbortSignal
    ): void;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Group>;
    parse(FBXBuffer: ArrayBuffer | string, path: string): Group;
}