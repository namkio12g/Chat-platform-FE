import React from 'react';

import { Sidebar } from './modules/Sidebar';
import { ThreadList } from './modules/ThreadList';
import { Conversation } from './modules/Conversation';
import './styles.scss'

export default function Dashboard() {
  return (
    <div className='GoChat-dashboard min-h-screen h-screen w-full bg-slate-100 text-slate-900 flex dark'>
      <Sidebar />
      <div className='flex-1 flex border-l border-slate-200'>
        <ThreadList />
        <Conversation />
      </div>
    </div>
  );
}
