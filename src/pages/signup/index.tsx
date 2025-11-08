import AnimatedBlock from '../login/modules/AnimatedBlock';
import SignupFormBlock from './modules/SignupFormBlock';
import '../login/styles.scss';

export default function Signup() {
  return (
    <div className='h-screen bg-background flex flex-row p-4'>
      <AnimatedBlock />
      <SignupFormBlock />
    </div>
  );
}
