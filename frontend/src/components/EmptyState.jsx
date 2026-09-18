import { useNavigate } from 'react-router-dom';

/**
 * Friendly Empty State component
 * @param {boolean} isFiltered - True if no results match the current search/filter
 * @param {Function} onClearFilters - Callback to clear active filters
 */
export default function EmptyState({ isFiltered = false, onClearFilters }) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-7 border border-[#eceae5] card-elevation-1 flex flex-col items-center text-center my-3 transition-all">
      {/* Decorative Icon Graphic */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center text-primary-container shadow-inner">
          <span
            className="material-symbols-outlined text-[38px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isFiltered ? 'filter_alt_off' : 'work_outline'}
          </span>
        </div>
        {!isFiltered && (
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-container text-surface-container-lowest flex items-center justify-center shadow-md border-2 border-surface-container-lowest">
            <span className="material-symbols-outlined text-[16px] font-bold">add</span>
          </div>
        )}
      </div>

      {/* Heading */}
      <h3 className="text-[18px] font-bold text-on-surface tracking-tight mb-1.5">
        {isFiltered ? 'No matches found' : 'No job applications tracked yet!'}
      </h3>

      {/* Description */}
      <p className="text-[13px] text-secondary leading-relaxed max-w-[260px] mb-5">
        {isFiltered
          ? "We couldn't find any applications matching your active filters or search terms."
          : "Click the '+' button to add your first application and track your search effortlessly."}
      </p>

      {/* Action Button */}
      {isFiltered ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="h-10 px-5 rounded-xl bg-surface-container text-primary text-[13px] font-semibold border border-outline-variant/50 hover:bg-surface-container-high active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          Clear All Filters
        </button>
      ) : (
        <button
          type="button"
          onClick={() => navigate('/add')}
          className="h-11 px-6 rounded-xl bg-primary-container text-surface-container-lowest text-[14px] font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add First Application
        </button>
      )}
    </div>
  );
}
