import React from 'react';

export function Sidebar(): JSX.Element {
  return (
    <aside className='w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4'>
      <button className='w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center'>
        ≡
      </button>
      <div className='w-10 h-10 rounded-lg bg-slate-200' />
      <div className='w-10 h-10 rounded-lg bg-slate-200' />
      <div className='w-10 h-10 rounded-lg bg-slate-200' />
      <div className='mt-auto w-10 h-10 rounded-full bg-slate-300' />
    </aside>
  );
}
