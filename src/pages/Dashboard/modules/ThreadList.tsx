import React from 'react';

export function ThreadList(): JSX.Element {
  return (
    <section className='w-80 bg-white border-r border-slate-200 flex flex-col'>
      <div className='p-3 border-b border-slate-200'>
        <input
          className='w-full h-9 rounded-lg bg-slate-100 px-3 outline-none'
          placeholder='Find or start a new chat'
        />
      </div>
      <div className='flex-1 overflow-y-auto'>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className='flex items-start gap-3 px-3 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100'
          >
            <div className='w-10 h-10 rounded-full bg-slate-200' />
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between'>
                <p className='font-medium text-sm text-slate-900 truncate'>
                  Maria Fernanda
                </p>
                <span className='text-xs text-slate-400'>11:24 AM</span>
              </div>
              <p className='text-xs text-slate-500 truncate'>
                Hi, my CPU usage spikes to 100% even when I&apos;m not running
                anything heavy...
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
