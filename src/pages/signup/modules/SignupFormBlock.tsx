import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signupUser } from '@/store/thunks/authThunks';
import {
  selectAuthLoading,
  selectAuthError,
} from '@/store/selectors/authSelectors';
import { toast } from 'sonner';
import { loginFailure, loginSuccess } from '@/store/slices/authSlice';

export default function SignupFormBlock() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setIsSubmitting(true);
    const result = await dispatch(signupUser({ userName, email, password }));

    if (signupUser.fulfilled.match(result)) {
      toast.success('Account created successfully! Welcome to GoChat!');
      dispatch(
        loginSuccess({ user: result.payload.user, token: result.payload.token })
      );
      navigate('/dashboard');
    } else if (signupUser.rejected.match(result)) {
      toast.error((result.payload as string) || 'Signup failed');
      dispatch(loginFailure((result.payload as string) || 'Signup failed'));
    }
    setIsSubmitting(false);
  };

  return (
    <div className='w-1/2 h-screen bg-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-4'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <MessageCircle className='h-10 w-10 text-primary' />
            <h1 className='text-3xl font-bold'>GoChat Platform</h1>
          </div>
          <p className='text-muted-foreground'>
            Create your account to get started
          </p>
        </div>

        {/* Signup Form */}
        <div className='bg-slate-200 rounded-2xl p-4 shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700'>
          <form onSubmit={handleSubmit} className='space-y-3'>
            <div className='space-y-1'>
              <label htmlFor='name' className='text-sm font-medium'>
                UserName
              </label>
              <div className='relative'>
                <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <input
                  id='name'
                  type='text'
                  placeholder='Enter your full name'
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200'
                  required
                />
              </div>
            </div>

            <div className='space-y-1'>
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

            <div className='space-y-1'>
              <label htmlFor='password' className='text-sm font-medium'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Create a password'
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

            <div className='space-y-1'>
              <label htmlFor='confirmPassword' className='text-sm font-medium'>
                Confirm Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirm your password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full pl-10 pr-12 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <label className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  className='rounded border-input'
                  required
                />
                <span className='text-sm text-muted-foreground'>
                  I agree to the{' '}
                  <button
                    type='button'
                    className='text-primary hover:underline'
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type='button'
                    className='text-primary hover:underline'
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            {error && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm'>
                {error}
              </div>
            )}

            <Button
              type='submit'
              className='w-full py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl'
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-muted-foreground'>
              Already have an account?{' '}
              <button
                type='button'
                onClick={() => navigate('/login')}
                className='text-primary hover:underline transition-colors'
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
