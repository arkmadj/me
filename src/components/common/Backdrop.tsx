// Ambient layers between the grid and the game: glow, scanlines, scan beam, vignette
export const Backdrop = () => (
  <div aria-hidden='true' className='absolute inset-0 -z-10 overflow-hidden pointer-events-none'>
    {/* Aurora glow behind the title */}
    <div className='absolute left-1/2 top-[38%] size-[56rem] max-md:size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.2),transparent_62%)] animate-drift' />
    <div className='absolute left-[62%] top-[30%] size-[34rem] max-md:size-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.1),transparent_65%)] animate-drift [animation-direction:reverse] [animation-duration:24s]' />

    {/* CRT scanlines */}
    <div className='absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.28)_0_1px,transparent_1px_3px)]' />

    {/* Slow scan beam */}
    <div className='absolute inset-x-0 top-0 h-48 bg-linear-to-b from-transparent via-green-400/[0.05] to-transparent animate-scan' />

    {/* Vignette */}
    <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.9)_100%)]' />
  </div>
);
