import {
  CATEGORIES,
  CATEGORY_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Category,
  type ListFilters,
  type Priority,
  type Status,
} from '../../types/serviceRequest';

interface RequestFiltersProps {
  filters: ListFilters;
  hasActiveFilters: boolean;
  onChange: (patch: Partial<ListFilters>) => void;
  onClear: () => void;
}

export function RequestFilters({ filters, hasActiveFilters, onChange, onClear }: RequestFiltersProps) {
  return (
    <form className="filters" role="search" aria-label="Filter requests" onSubmit={(event) => event.preventDefault()}>
      <div className="field filters-search">
        <label htmlFor="filter-search">Search requests</label>
        <input
          id="filter-search"
          type="search"
          value={filters.search}
          maxLength={100}
          placeholder="Title, description or requester"
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value as Status | '' })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-priority">Priority</label>
        <select
          id="filter-priority"
          value={filters.priority}
          onChange={(event) => onChange({ priority: event.target.value as Priority | '' })}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value as Category | '' })}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button type="button" className="btn btn-ghost filters-clear" onClick={onClear}>
          Clear filters
        </button>
      )}
    </form>
  );
}
