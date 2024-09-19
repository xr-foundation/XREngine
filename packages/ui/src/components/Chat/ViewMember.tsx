import React from 'react'
import { MdDelete } from 'react-icons/md'

import { UserName } from '@xrengine/common/src/schema.type.module'

import UserIcon from './assets/user.svg'

export const ViewMember = () => {
  const Members: { name: UserName }[] = [
    { name: 'John Laouireen' as UserName },
    { name: 'John Laouireen' as UserName },
    { name: 'John Laouireen' as UserName },
    { name: 'John Laouireen' as UserName },
    { name: 'John Laouireen' as UserName },
    { name: 'John Laouireen' as UserName }
  ]

  return (
    <div className="w-[380px] translate-x-0 transform bg-[#15171B] text-white transition-transform duration-[100] ease-in-out">
      <div className="ml-9 mt-[45px] flex w-[200px] flex-wrap  justify-start gap-2">
        <p className="text-[16px] font-bold text-white">GROUP TEST 1</p>
        <p className="mt-[5px] text-[10px] font-bold text-[#83769C]">12 Member (s)</p>
      </div>
      <div className="mt-9 flex w-[380px] flex-wrap justify-center gap-2">
        {Members.map((item) => {
          return (
            <div className="flex h-[45px] w-[350px] flex-wrap rounded-[10px] bg-[#15171B]">
              <div className="my-2 ml-4 h-[30px] w-[30px] justify-between rounded-full bg-[#26282B]">
                <img className="mx-2 h-[28.64px] w-[13.64px] max-w-full overflow-hidden" alt="" src={UserIcon} />
              </div>
              <p className="ml-3 mt-3.5 w-[220px] text-[12px] font-bold text-white">{item.name}</p>
              <div className="my-2  h-[30px] w-[30px] justify-between rounded-full bg-[#26282B]">
                <button className="m-0 w-[40px] ">
                  <MdDelete className="mx-1 h-[30px] w-[22px] overflow-hidden fill-[#DD3333]" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
