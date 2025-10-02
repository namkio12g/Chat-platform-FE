import AnimatedBlock from './AnimatedBlock';
import FormBlock from './FormBlock';

export default function Login() {
  return (
    <div className='min-h-screen bg-background flex flex-row'>
      <AnimatedBlock />
      <FormBlock />
    </div>
  );
}
