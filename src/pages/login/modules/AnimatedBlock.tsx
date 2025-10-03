import React from 'react';

const Moved_Tile = () => {
  return (
    <>
      <div className='tile t-1 col-start-1 row-start-1 p-1'>
        <div className=' bg-purple-600 rounded-lg flex items-center justify-center h-full w-full'>
          <svg
            className='w-8 h-8 text-white'
            viewBox='0 0 24 24'
            fill='currentColor'
          >
            <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
          </svg>
        </div>
      </div>
      <div className='tile t-2 col-start-1 row-start-2 p-1'>
        <div className=' bg-yellow-400 rounded-lg p-4 flex flex-col justify-center relative h-full w-full'>
          <div className='absolute top-2 left-2 w-4 h-4 bg-black rounded flex items-center justify-center'>
            <span className='text-white text-xs font-bold'>+</span>
          </div>
          <div className='mt-4'>
            <h3 className='text-black text-sm font-bold'>Building trust</h3>
            <h3 className='text-black text-sm font-bold'>in blockchain</h3>
            <h3 className='text-black text-sm font-bold'>technology</h3>
          </div>
        </div>
      </div>
      <div className='tile t-3 col-start-2 row-start-2 p-1'>
        <div className=' bg-yellow-400 rounded-lg p-4 flex flex-col justify-center relative h-full w-full'>
          <div className='absolute top-2 left-2 w-4 h-4 bg-black rounded flex items-center justify-center'>
            <span className='text-white text-xs font-bold'>+</span>
          </div>
          <div className='mt-4'>
            <h3 className='text-black text-sm font-bold'>Own</h3>
            <h3 className='text-black text-sm font-bold'>your power</h3>
          </div>
        </div>
      </div>
      <div className='tile t-4 col-start-2 row-start-3 p-1'>
        <div className='bg-purple-600 rounded-lg p-4 flex flex-col justify-center relative h-full w-full'>
          <div className='absolute inset-0 opacity-15'>
            <div className='grid grid-cols-4 gap-1 h-full w-full p-2'>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className='text-white text-xs'>
                  +
                </div>
              ))}
            </div>
          </div>
          <div className='relative z-10 text-center'>
            <h2 className='text-white text-sm font-bold mb-1'>Total Care.</h2>
            <h2 className='text-white text-sm font-bold'>Total Different.</h2>
          </div>
        </div>
      </div>
    </>
  );
};
export default function AnimatedBlock() {
  return (
    <div className='animated-block w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden rounded-2xl'>
      {/* Animated Background Shapes */}
      <div className='absolute inset-0'>
        {/* Large floating shapes */}
        <div className='absolute top-20 left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute top-40 right-32 w-64 h-64 bg-blue-500/15 rounded-full blur-2xl animate-pulse delay-1000'></div>
        <div className='absolute bottom-32 left-1/3 w-72 h-72 bg-indigo-500/25 rounded-full blur-3xl animate-pulse delay-2000'></div>
        <div className='absolute bottom-20 right-1/4 w-56 h-56 bg-violet-500/20 rounded-full blur-2xl animate-pulse delay-500'></div>

        {/* Smaller floating elements */}
        <div className='absolute top-1/3 right-1/5 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl animate-bounce delay-3000'></div>
        <div className='absolute bottom-1/3 left-1/5 w-24 h-24 bg-orange-500/25 rounded-full blur-lg animate-bounce delay-4000'></div>
      </div>
      {/* Grid Layout */}

      {/* <div className='animated-block-grid-bg absolute z-1 h-fit'>
        <div className='grid grid-cols-4 grid-rows-5 h-full'>
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className='tile border-4 border-black'>
              <div className=' bg-transparent h-full w-full'></div>
            </div>
          ))}
        </div>
      </div> */}
      <div className='animated-block-grid-bg absolute z-10 h-fit'>
        <div className='grid grid-cols-4 grid-rows-5 h-full'>
          {Array.from({ length: 14 }).map((_, index) => (
            <div key={index} className='tile p-1'>
              <div className=' bg-gray-100/5 rounded-lg h-full w-full'></div>
            </div>
          ))}
          <div className='relative grid grid-cols-2 grid-rows-3 col-span-2 row-span-3 col-start-2 row-start-2'>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className='tile p-1'>
                <div className='bg-slate-300/20 rounded-lg h-full w-full' />
              </div>
            ))}
            <div className='moving-blocks-grid absolute top-0 left-0 w-full h-full rounded-lg grid grid-cols-2 grid-rows-3'>
              <Moved_Tile />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
