import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./DashboardControls.css";

export type StatusTabOption<T extends string> = {
  label: string;
  value: T;
  count?: number;
};

export type FilterOption<T extends string> = {
  label: string;
  value: T;
};

export const DEFAULT_PAGE_SIZE = 10;

export function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

export function useDashboardQueryState<TStatus extends string>(
  defaultStatus: TStatus,
  pageSize = DEFAULT_PAGE_SIZE,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [status, setStatusState] = useState<TStatus>(
    (searchParams.get("status") as TStatus | null) ?? defaultStatus,
  );
  const [page, setPageState] = useState(
    Math.max(Number(searchParams.get("page") ?? "1"), 1),
  );

  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    const next = new URLSearchParams();

    if (debouncedSearch) next.set("q", debouncedSearch);

    if (status !== defaultStatus) next.set("status", status);

    if (page > 1) next.set("page", String(page));

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [debouncedSearch, defaultStatus, page, searchParams, setSearchParams, status]);

  const setStatus = (nextStatus: TStatus) => {
    setStatusState(nextStatus);
    setPageState(1);
  };

  const setPage = (nextPage: number) => setPageState(Math.max(nextPage, 1));

  return {
    search,
    debouncedSearch,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

export function normalizeSearch(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

export function matchesSearch<T>(
  item: T,
  search: string,
  selectors: Array<(item: T) => unknown>,
) {
  const query = normalizeSearch(search);
  if (!query) return true;
  return selectors.some((selector) => normalizeSearch(selector(item)).includes(query));
}

export function paginateItems<T>(items: T[], page: number, pageSize = DEFAULT_PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="dashboard-search">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: Array<FilterOption<T>>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="dashboard-filter-select">
      {label && <span>{label}</span>}
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function StatusTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<StatusTabOption<T>>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="dashboard-status-tabs">
      {options.map((option) => (
        <button
          key={option.value}
          className={`dashboard-status-tab ${value === option.value ? "active" : ""}`}
          onClick={() => onChange(option.value)}
          type="button"
        >
          <span>{option.label}</span>
          {typeof option.count === "number" && (
            <strong>{option.count.toLocaleString()}</strong>
          )}
        </button>
      ))}
    </div>
  );
}

export function PaginationControls({
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  total,
  onPageChange,
}: {
  page: number;
  pageSize?: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  if (total <= pageSize && page === 1) return null;

  return (
    <nav className="dashboard-pagination" aria-label="Pagination">
      <span>
        {from}-{to} of {total.toLocaleString()}
      </span>
      <div>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            className={item === page ? "active" : ""}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
