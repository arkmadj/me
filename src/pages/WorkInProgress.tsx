import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import MatrixRain from '@/components/common/MatrixRain';

const WorkInProgress = () => {
  return (
    <div className='relative z-10 h-full overflow-hidden'>
      <MatrixRain className='absolute inset-0 z-0' />
      
      <main className='relative z-10 h-full flex flex-col items-center justify-center gap-6'>
        <h1 className='text-6xl text-green-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'>
          WIP
        </h1>
        <p className='text-green-400 font-mono text-lg text-center px-4'>
          This part of the matrix is still being compiled...
        </p>
        <Link
          to={ROUTES.HOME}
          className='text-green-400 font-mono text-sm tracking-wider border border-green-400 px-6 py-3 rounded hover:bg-green-400 hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]'
        >
          Return to Reality
        </Link>
      </main>
    </div>
  );
};

export default WorkInProgress;
