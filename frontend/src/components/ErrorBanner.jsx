/**
 * iOS-style error alert with retry button
 */
export default function ErrorBanner({ message, onRetry }) {
  return (
    <div
      className="rounded-[16px] p-3.5 flex items-start gap-3 animate-fadeIn"
      style={{
        background: 'rgba(255,59,48,0.08)',
        border: '0.5px solid rgba(255,59,48,0.20)',
      }}
    >
      <span
        className="material-symbols-outlined shrink-0 mt-0.5"
        style={{ fontSize: '20px', color: '#FF3B30', fontVariationSettings: "'FILL' 1" }}
      >
        error
      </span>
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-semibold leading-snug break-words"
          style={{ color: '#FF3B30' }}
        >
          {message || 'Unable to connect to the database.'}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,59,48,0.65)' }}>
          Please ensure your Express server and MongoDB are healthy.
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 active:scale-95"
          style={{ background: 'rgba(255,59,48,0.12)', color: '#FF3B30' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
