import { useNavigate } from 'react-router-dom';

/**
 * iOS-style Empty State component
 * @param {boolean} isFiltered - True if no results match the current search/filter
 * @param {Function} onClearFilters - Callback to clear active filters
 */
export default function EmptyState({ isFiltered = false, onClearFilters }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center text-center my-3 p-8 transition-all"
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
      }}
    >
      {/* Decorative Icon */}
      <div className="relative mb-5">
        <div
          className="w-20 h-20 rounded-[22px] flex items-center justify-center"
          style={{ background: 'rgba(0,122,255,0.10)' }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '38px',
              color: '#007AFF',
              fontVariationSettings: "'FILL' 1",
            }}
          >
            {isFiltered ? 'filter_alt_off' : 'work_outline'}
          </span>
        </div>
        {!isFiltered && (
          <div
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
            style={{ background: '#007AFF' }}
          >
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: '16px', fontVariationSettings: "'wght' 600" }}
            >
              add
            </span>
          </div>
        )}
      </div>

      {/* Heading */}
      <h3
        className="text-[18px] font-semibold tracking-tight mb-2"
        style={{ color: '#000', letterSpacing: '-0.01em' }}
      >
        {isFiltered ? 'No matches found' : 'No applications yet'}
      </h3>

      {/* Description */}
      <p
        className="text-[14px] leading-relaxed max-w-[260px] mb-6"
        style={{ color: '#8E8E93' }}
      >
        {isFiltered
          ? "No applications match your active filters or search terms."
          : "Tap the '+' tab to add your first application and start tracking your job search."}
      </p>

      {/* CTA */}
      {isFiltered ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="h-10 px-5 rounded-full text-[14px] font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-[0.95]"
          style={{ background: 'rgba(255,59,48,0.10)', color: '#FF3B30' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restart_alt</span>
          Clear All Filters
        </button>
      ) : (
        <button
          type="button"
          onClick={() => navigate('/add')}
          className="h-[46px] px-6 rounded-full text-white text-[15px] font-semibold flex items-center gap-2 transition-all duration-150 active:scale-[0.96]"
          style={{
            background: 'linear-gradient(180deg, #339DFF 0%, #007AFF 100%)',
            boxShadow: '0 4px 16px rgba(0,122,255,0.4), 0 1px 4px rgba(0,122,255,0.2)',
          }}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
            add_circle
          </span>
          Add First Application
        </button>
      )}
    </div>
  );
}
