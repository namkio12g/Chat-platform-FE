import React, { useState, useEffect } from 'react';
import { useThrottle } from '../../../hooks/useThrottle';


const statusSelection=[
  {
    id: 1,
    name: 'All',
  },
  
  {
    id: 2,
    name: 'Unread',
  },
  {
    id: 3,
    name: 'Read',
  }
]

export const ThreadList = () => {
    const mockdata=[
    {
      id: 1,
      name: 'Maria Fernanda',
      lastMessage: 'Hi, my CPU usage spikes to 100% even when I\'m not running anything heavy...',
      lastMessageTime: '11:24 AM',
    },
    {
      id: 2,
      name: 'James Bond',
      lastMessage: 'Hi, how are you?',
      lastMessageTime: '10:24 AM',
    },
    {
      id: 3,
      name: 'John Doe',
      lastMessage: 'hello, what are you doing?',
      lastMessageTime: '09:24 PM',
    }
  ]
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(mockdata);
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState(1);
  
  // Throttle search input with 300ms delay
  const throttledSearch = useThrottle(search, 300);

  const mockimg='https://img.freepik.com/premium-vector/man-avatar-profile-picture-isolated-background-avatar-profile-picture-man_1293239-4866.jpg'
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsSearching(true);
  }

  const handleStatus = (id: number) => {
    setStatus(id);
  }

  useEffect(() => {
    if (throttledSearch.trim() === '') {
      setFilteredData(mockdata);
    } else {
      setFilteredData(
        mockdata.filter((item) => 
          item.name.toLowerCase().includes(throttledSearch.toLowerCase())
        )
      );
    }
    setIsSearching(false);
  }, [throttledSearch]);
  
  return (
    <section className='GoChat-thread-list w-80 bg-white border-r border-slate-200 flex flex-col'>
      <div className='p-3 border-b border-slate-200'>
        <input
          className='w-full h-9 rounded-lg bg-slate-100 px-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200'
          placeholder='Find or start a new chat'
          value={search}
          onChange={handleSearch}
        />
      </div>
       <div className='message-status-selection py-2 border-b border-slate-200 flex flex-row gap-2 overflow-x-auto relative'>
         {statusSelection.map((item) => (
           <button 
             key={item.id}
             className='message-status-button w-full items-center justify-center flex relative' 
             onClick={() => handleStatus(item.id)}
           >
             <div className={`w-fit px-4 py-1 h-full bg-slate-200 rounded-lg transition-colors duration-200 ${status === item.id ? 'bg-blue-500 text-white' : ''}`}>
               {item.name}
             </div>
           </button>
         ))}
         {/* Sliding indicator line */}
         <div 
           className='sliding-indicator'
           style={{
             width: `${100 / statusSelection.length}%`,
             left: `${((status - 1) * 100) / statusSelection.length}%`
           }}
         />
       </div>
      <div className='flex-1 overflow-y-auto'>
        {isSearching ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
            <span className='ml-2 text-sm text-slate-500'>Searching...</span>
          </div>
        ) : filteredData.length === 0 && search.trim() !== '' ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <div className='w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3'>
              <svg className='w-8 h-8 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>
            <p className='text-sm text-slate-500 mb-1'>No conversations found</p>
            <p className='text-xs text-slate-400'>Try searching with different keywords</p>
          </div>
        ) : (
          filteredData.map((item, i) => (
            <div
              key={i}
              className='flex items-start gap-3 px-3 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100'
            >
              <div className='w-10 h-10 rounded-full bg-slate-200 relative'>
                <img src={mockimg} alt='avatar' className='w-full h-full rounded-full' />
                <div className='absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-green-500'></div>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between'>
                  <p className='font-medium text-sm text-slate-900 truncate'>
                    {item.name}
                  </p>
                  <span className='text-xs text-slate-400'>{item.lastMessageTime}</span>
                </div>
                <p className='text-xs text-slate-500 truncate'>
                  {item.lastMessage}  
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
