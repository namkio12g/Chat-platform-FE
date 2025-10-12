import React from 'react';

function Topbar(): JSX.Element {
  return (
    <div className='h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3'>
      <div className='w-8 h-8 rounded-full bg-green-400' />
      <div className='flex flex-col'>
        <span className='text-sm font-medium'>Maria Fernanda</span>
        <span className='text-xs text-slate-500'>Typing…</span>
      </div>
      <div className='ml-auto flex items-center gap-3 text-slate-500'>
        <button>🛈</button>
        <button>🔔</button>
        <button>📞</button>
        <button>⋯</button>
      </div>
    </div>
  );
}

function MessageList(): JSX.Element {
  return (
    <div className='flex-1 overflow-y-auto bg-sky-50/40 relative'>
      <div className='absolute inset-0 opacity-5 pointer-events-none' />
      <div className='p-6 space-y-4'>
        <div className='max-w-lg bg-white shadow-sm rounded-lg p-4 text-sm'>
          Hi, my CPU usage spikes to 100% even when I&apos;m not running
          anything heavy.
        </div>
        <div className='max-w-md bg-white/70 rounded-lg p-3 text-xs ml-8'>
          Yes, it looks like some background processes are spiking your CPU
          usage unexpectedly...
        </div>
        <div className='flex justify-end'>
          <div className='max-w-md bg-sky-500 text-white rounded-lg p-3 text-sm'>
            OK, let me check this out for a moment. Thank you for your patience.
          </div>
        </div>
      </div>
    </div>
  );
}

function Composer(): JSX.Element {
  return (
    <div className='h-16 bg-white border-t border-slate-200 flex items-center px-4 gap-3'>
      <button className='w-9 h-9 rounded-lg bg-slate-100'>＋</button>
      <input
        className='flex-1 h-10 rounded-full bg-slate-100 px-4 outline-none'
        placeholder='Type a message'
      />
      <button className='px-4 h-10 rounded-full bg-sky-500 text-white text-sm'>
        Send
      </button>
    </div>
  );
}

export function Conversation(): JSX.Element {
  return (
    <section className='flex-1 flex flex-col'>
      <Topbar />
      <MessageList />
      <Composer />
    </section>
  );
}
