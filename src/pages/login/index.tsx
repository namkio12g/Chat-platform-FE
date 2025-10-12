import AnimatedBlock from './modules/AnimatedBlock';
import FormBlock from './modules/FormBlock';
import './styles.scss';

export default function Login() {
  return (
    <div className='h-screen bg-background flex flex-row p-4 dark:bg-gray-900 '>
      <AnimatedBlock />
      <FormBlock />
    </div>
  );
}
