import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/thunks/authThunks';
import {
  selectAuthLoading,
  selectAuthError,
} from '@/store/selectors/authSelectors';
import { toast } from 'sonner';
import { loginFailure, loginSuccess } from '@/store/slices/authSlice';

export default function FormBlock() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      toast.success('Login successful! Welcome back!');
      dispatch(
        loginSuccess({ user: result.payload.user, token: result.payload.token })
      );
      navigate('/dashboard');
    } else if (loginUser.rejected.match(result)) {
      toast.error((result.payload as string) || 'Login failed');
      dispatch(loginFailure((result.payload as string) || 'Login failed'));
    }
  };

  return (
    <div className='w-1/2 h-screen bg-white flex items-center justify-center p-8  dark:bg-gray-900'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center gap-2 mb-4'>
            <MessageCircle className='h-10 w-10 text-primary' />
            <h1 className='text-3xl font-bold'>GoChat Platform</h1>
          </div>
          <p className='text-muted-foreground'>
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className='bg-white rounded-2xl p-8 shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-medium'>
                Email
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200'
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label htmlFor='password' className='text-sm font-medium'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full pl-10 pr-12 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <label className='flex items-center space-x-2'>
                <input type='checkbox' className='rounded border-input' />
                <span className='text-sm text-muted-foreground'>
                  Remember me
                </span>
              </label>
              <button
                type='button'
                className='text-sm text-primary hover:underline transition-colors'
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm'>
                {error}
              </div>
            )}

            <Button
              type='submit'
              className='w-full py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl'
              disabled={isLoading}
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-muted-foreground'>
              Don't have an account?{' '}
              <button className='text-primary hover:underline transition-colors'>
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className='mt-6 p-4 bg-muted/50 rounded-lg'>
          <p className='text-sm text-muted-foreground text-center'>
            <strong>Demo:</strong> Use any email from the database and password:{' '}
            <code className='bg-gray-200 px-1 rounded'>password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
