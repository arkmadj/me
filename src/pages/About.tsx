import MatrixRain from '@/components/common/MatrixRain';

const About = () => {
  return (
    <div className='relative z-10 h-full overflow-hidden'>
      <MatrixRain className='absolute inset-0 z-0' />

      <main className='relative z-10 h-full flex flex-col items-center justify-start gap-8 px-6 py-12 overflow-y-auto'>
        <h1 className='text-5xl max-md:text-4xl text-green-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] mt-8'>
          About Me
        </h1>

        <div className='max-w-3xl space-y-6 text-green-400 font-mono'>
          <section className='border border-green-400/30 rounded-lg p-6 bg-black/40 backdrop-blur-sm hover:border-green-400/60 transition-all duration-300'>
            <h2 className='text-2xl font-bold mb-4 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]'>
              Hello, I'm a Developer
            </h2>
            <p className='text-green-300 leading-relaxed'>
              Welcome to my corner of the matrix. I'm a passionate developer who loves creating
              interactive web experiences and solving complex problems with elegant code.
            </p>
          </section>

          <section className='border border-green-400/30 rounded-lg p-6 bg-black/40 backdrop-blur-sm hover:border-green-400/60 transition-all duration-300'>
            <h2 className='text-2xl font-bold mb-4 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]'>
              What I Do
            </h2>
            <ul className='text-green-300 leading-relaxed space-y-2 list-disc list-inside'>
              <li>Build modern web applications with React and TypeScript</li>
              <li>Create engaging user interfaces with smooth animations</li>
              <li>Design responsive and accessible experiences</li>
              <li>Explore creative coding and interactive design</li>
            </ul>
          </section>

          <section className='border border-green-400/30 rounded-lg p-6 bg-black/40 backdrop-blur-sm hover:border-green-400/60 transition-all duration-300'>
            <h2 className='text-2xl font-bold mb-4 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]'>
              Tech Stack
            </h2>
            <div className='flex flex-wrap gap-3'>
              {['React', 'TypeScript', 'Tailwind CSS', 'Anime.js', 'Vite', 'Node.js'].map(
                (tech) => (
                  <span
                    key={tech}
                    className='px-4 py-2 border border-green-400 rounded text-sm hover:bg-green-400 hover:text-black transition-all duration-300 hover:shadow-[0_0_10px_rgba(34,197,94,0.6)]'
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </section>

          <section className='border border-green-400/30 rounded-lg p-6 bg-black/40 backdrop-blur-sm hover:border-green-400/60 transition-all duration-300'>
            <h2 className='text-2xl font-bold mb-4 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]'>
              Beyond Code
            </h2>
            <p className='text-green-300 leading-relaxed'>
              When I'm not coding, you'll find me exploring new technologies, contributing to
              open source, or diving into the latest web development trends. I believe in
              continuous learning and sharing knowledge with the community.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
