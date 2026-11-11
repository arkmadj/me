import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ROUTES } from "@/routes/paths";

// Deliberately dependency-free: no MatrixRain, game context or layout pieces,
// since any of those could be the thing that just crashed.

// A lazy route's chunk 404s after a redeploy; a reload picks up the new build
const isChunkLoadError = (error: unknown) =>
  error instanceof Error &&
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    error.message,
  );

const describe = (error: unknown) => {
  if (isRouteErrorResponse(error)) {
    return { title: `${error.status}`, message: error.statusText || "Something went wrong." };
  }
  if (isChunkLoadError(error)) {
    return { title: "Update available", message: "A new version was deployed. Reload to continue." };
  }
  return { title: "System failure", message: "The matrix glitched while rendering this page." };
};

type Props = {
  /** Root-level boundary: the layout is gone too, so fill the viewport ourselves */
  fullscreen?: boolean;
};

const RouteError = ({ fullscreen = false }: Props) => {
  const error = useRouteError();
  const { title, message } = describe(error);

  if (import.meta.env.DEV) console.error(error);

  const buttonClass =
    "text-green-400 font-mono text-sm tracking-wider border border-green-400 px-6 py-3 rounded hover:bg-green-400 hover:text-black transition-colors duration-300";

  return (
    <main
      role="alert"
      className={`${fullscreen ? "h-svh supports-[height:100dvh]:h-dvh bg-black" : "h-full"} relative z-10 flex flex-col items-center justify-center gap-6 px-4 text-center`}
    >
      <h1 className="text-4xl sm:text-6xl text-green-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
        {title}
      </h1>
      <p className="text-green-400 font-mono text-lg">{message}</p>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="max-w-full overflow-auto text-left text-xs text-green-300/70 font-mono border border-green-900 rounded p-3">
          {error.stack ?? error.message}
        </pre>
      )}
      <div className="flex flex-wrap justify-center gap-4">
        <button type="button" onClick={() => window.location.reload()} className={buttonClass}>
          Reload
        </button>
        {/* Full navigation, not <Link>: resets whatever state caused the crash */}
        <a href={ROUTES.HOME} className={buttonClass}>
          Return to Reality
        </a>
      </div>
    </main>
  );
};

export default RouteError;
