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
import { ThemeToggle } from '@/components/ThemeToggle';
import { MessageCircle, Plus, Minus, Database } from 'lucide-react';
import { Toaster } from 'sonner';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';

function App() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const { data: posts, isLoading, error } = usePosts();

  // Initialize authentication from localStorage
  useAuthInitialization();

  return (
    <div className='min-h-screen bg-background p-8'>
      <div className='max-w-4xl mx-auto space-y-8'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <div className='flex items-center justify-center gap-2'>
            <MessageCircle className='h-8 w-8 text-primary' />
            <h1 className='text-4xl font-bold'>Chat Platform</h1>
            <div className='ml-auto'>
              <ThemeToggle />
            </div>
          </div>
          <p className='text-muted-foreground text-lg'>
            Built with React, Redux, TanStack Query, Tailwind CSS, and shadcn/ui
          </p>
        </div>

        {/* Redux Counter Demo */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Database className='h-5 w-5' />
              Redux State Management
            </CardTitle>
            <CardDescription>Counter managed by Redux Toolkit</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-center'>
              <div className='text-6xl font-bold text-primary mb-4'>
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

        {/* TanStack Query Demo */}
        <Card>
          <CardHeader>
            <CardTitle>TanStack Query Data Fetching</CardTitle>
            <CardDescription>
              Fetching posts from JSONPlaceholder API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                <p className='mt-2 text-muted-foreground'>Loading posts...</p>
              </div>
            )}

            {error && (
              <div className='text-center py-8'>
                <p className='text-destructive'>
                  Error loading posts: {(error as Error).message}
                </p>
              </div>
            )}

            {posts && (
              <div className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  Loaded {posts.length} posts successfully
                </p>
                <div className='grid gap-4 max-h-96 overflow-y-auto'>
                  {posts.slice(0, 5).map((post) => (
                    <div
                      key={post.id}
                      className='p-4 border rounded-lg bg-muted/50'
                    >
                      <h3 className='font-semibold text-sm mb-2'>
                        {post.title}
                      </h3>
                      <p className='text-xs text-muted-foreground line-clamp-2'>
                        {post.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>Modern React development stack</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {[
                { name: 'React 18', description: 'UI Library' },
                { name: 'TypeScript', description: 'Type Safety' },
                { name: 'Vite', description: 'Build Tool' },
                { name: 'Redux Toolkit', description: 'State Management' },
                { name: 'TanStack Query', description: 'Server State' },
                { name: 'Tailwind CSS', description: 'Styling' },
                { name: 'shadcn/ui', description: 'Components' },
                { name: 'Lucide React', description: 'Icons' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className='p-3 border rounded-lg bg-muted/30'
                >
                  <h4 className='font-medium text-sm'>{tech.name}</h4>
                  <p className='text-xs text-muted-foreground'>
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
