/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { EulerRotation, RotationOrder } from '../Types'

/** Euler rotation class. */
export default class Euler {
  public x: number
  public y: number
  public z: number
  public rotationOrder?: RotationOrder

  constructor(a?: number | EulerRotation, b?: number, c?: number, rotationOrder?: RotationOrder) {
    if (!!a && typeof a === 'object') {
      this.x = a.x ?? 0
      this.y = a.y ?? 0
      this.z = a.z ?? 0
      this.rotationOrder = a.rotationOrder ?? 'XYZ'
      return
    }

    this.x = a ?? 0
    this.y = b ?? 0
    this.z = c ?? 0
    this.rotationOrder = rotationOrder ?? 'XYZ'
  }

  /**
   * Multiplies a number to an Euler.
   * @param {number} a: Number to multiply
   */
  multiply(v: number) {
    return new Euler(this.x * v, this.y * v, this.z * v, this.rotationOrder)
  }
}