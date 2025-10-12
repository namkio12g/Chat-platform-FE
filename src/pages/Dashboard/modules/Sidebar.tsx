import React, { useState } from 'react';
import { User,Users,Settings,DoorOpen } from 'lucide-react';
import '../styles.scss';


export const Sidebar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside className={`GoChat-sidebar bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 px-4 ${isOpen ? 'expanded' : 'collapsed'}`}>
      <button className='sidebar-toggle-btn w-full h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center' onClick={toggleSidebar}>
        ≡
      </button>
      <div className='sidebar-item flex p-2 rounded-lg bg-slate-200 items-center gap-2 w-full'>
        <User className='w-4 h-4 flex-shrink-0' />
        <span className={`sidebar-text ${isOpen ? 'expanded' : 'collapsed'}`}>
          Friends
        </span>
      </div>
      <div className='sidebar-item flex p-2 rounded-lg bg-slate-200 items-center gap-2 w-full'>
        <Users className='w-4 h-4 flex-shrink-0' />
        <span className={`sidebar-text ${isOpen ? 'expanded' : 'collapsed'}`}>
          Groups
        </span>
      </div>
      <div className='sidebar-item flex p-2 rounded-lg bg-slate-200 items-center gap-2 w-full'>
        <Settings className='w-4 h-4 flex-shrink-0' />
        <span className={`sidebar-text ${isOpen ? 'expanded' : 'collapsed'}`}>
          Settings
        </span>
      </div>
      <div className='sidebar-item flex p-2 rounded-lg bg-slate-200 items-center gap-2 w-full'>
        <DoorOpen className='w-4 h-4 flex-shrink-0' />
        <span className={`sidebar-text ${isOpen ? 'expanded' : 'collapsed'}`}>
          Logout
        </span>
      </div>
      <div className={`sidebar-avatar mt-auto rounded-full bg-slate-300 ${isOpen ? 'expanded' : 'collapsed'}`} />
    </aside>
  );
}
