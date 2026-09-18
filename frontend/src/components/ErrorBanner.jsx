/**
 * Visually clean error alert with retry button
 */
export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-2xl bg-error-container/90 border border-error/20 p-3.5 flex items-start gap-3 shadow-sm backdrop-blur-sm animate-fadeIn">
      <span
        className="material-symbols-outlined text-[22px] text-error shrink-0 mt-0.5"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        error
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-on-error-container leading-snug break-words">
          {message || 'Unable to connect to the database.'}
        </p>
        <p className="text-[11px] text-on-error-container/75 mt-0.5">
          Please ensure your Express server and MongoDB connection are healthy.
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-container-lowest/80 text-[11px] font-bold text-error hover:bg-surface-container-lowest active:scale-95 transition-all shadow-xs"
        >
          Retry
        </button>
      )}
    </div>
  );
}
