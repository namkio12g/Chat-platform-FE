import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  increment,
  decrement,
  incrementByAmount,
} from '@/store/slices/counterSlice';
import { usePosts } from '@/hooks/usePosts';
import {
  MessageCircle,
  Plus,
  Minus,
  Database,
  LogOut,
  User,
  Settings,
  Bell,
  Search,
  Send,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const { data: posts, isLoading, error } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    // Clear any stored auth data here
    navigate('/login');
  };

  const filteredPosts =
    posts?.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.body.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b bg-card'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-3'>
              <MessageCircle className='h-8 w-8 text-primary' />
              <h1 className='text-xl font-bold'>Chat Platform</h1>
            </div>

            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <input
                  type='text'
                  placeholder='Search posts...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-64'
                />
              </div>

              <Button variant='ghost' size='icon'>
                <Bell className='h-5 w-5' />
              </Button>

              <Button variant='ghost' size='icon'>
                <Settings className='h-5 w-5' />
              </Button>

              <Button variant='ghost' size='icon'>
                <User className='h-5 w-5' />
              </Button>

              <Button onClick={handleLogout} variant='outline' size='sm'>
                <LogOut className='h-4 w-4 mr-2' />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Sidebar - Redux Demo */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Database className='h-5 w-5' />
                  Redux Counter
                </CardTitle>
                <CardDescription>
                  Interactive state management demo
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-primary mb-4'>
                    {count}
                  </div>
                  <div className='flex gap-2 justify-center'>
                    <Button
                      onClick={() => dispatch(decrement())}
                      variant='outline'
                      size='icon'
                    >
                      <Minus className='h-4 w-4' />
                    </Button>
                    <Button
                      onClick={() => dispatch(increment())}
                      variant='outline'
                      size='icon'
                    >
                      <Plus className='h-4 w-4' />
                    </Button>
                    <Button
                      onClick={() => dispatch(incrementByAmount(5))}
                      variant='default'
                    >
                      +5
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button className='w-full justify-start' variant='outline'>
                  <Send className='h-4 w-4 mr-2' />
                  New Message
                </Button>
                <Button className='w-full justify-start' variant='outline'>
                  <User className='h-4 w-4 mr-2' />
                  Add Contact
                </Button>
                <Button className='w-full justify-start' variant='outline'>
                  <Settings className='h-4 w-4 mr-2' />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Posts */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>
                  Data fetched with TanStack Query
                  {searchTerm && ` • Filtered by "${searchTerm}"`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div className='text-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                    <p className='mt-2 text-muted-foreground'>
                      Loading posts...
                    </p>
                  </div>
                )}

                {error && (
                  <div className='text-center py-8'>
                    <p className='text-destructive'>
                      Error loading posts: {(error as Error).message}
                    </p>
                  </div>
                )}

                {filteredPosts.length > 0 && (
                  <div className='space-y-4'>
                    <p className='text-sm text-muted-foreground'>
                      Showing {filteredPosts.length} of {posts?.length} posts
                    </p>
                    <div className='space-y-4 max-h-96 overflow-y-auto'>
                      {filteredPosts.slice(0, 10).map((post) => (
                        <div
                          key={post.id}
                          className='p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors'
                        >
                          <h3 className='font-semibold text-sm mb-2'>
                            {post.title}
                          </h3>
                          <p className='text-xs text-muted-foreground line-clamp-3'>
                            {post.body}
                          </p>
                          <div className='mt-2 flex items-center justify-between'>
                            <span className='text-xs text-muted-foreground'>
                              User ID: {post.userId}
                            </span>
                            <Button size='sm' variant='ghost'>
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredPosts.length === 0 && !isLoading && !error && (
                  <div className='text-center py-8'>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'No posts found matching your search.'
                        : 'No posts available.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
