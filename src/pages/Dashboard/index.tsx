import React from 'react';

import { Sidebar } from './modules/Sidebar';
import { ThreadList } from './modules/ThreadList';
import { Conversation } from './modules/Conversation';

export default function Dashboard() {
  return (
    <div className='min-h-screen h-screen w-full bg-slate-100 text-slate-900 flex'>
      <Sidebar />
      <div className='flex-1 flex border-l border-slate-200'>
        <ThreadList />
        <Conversation />
      </div>
    </div>
  );
}
