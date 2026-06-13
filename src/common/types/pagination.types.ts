export interface PaginatedResult<T> {
  data: T[];
  links: {
    self: string;
    first: string;
    prev: string | null;
    next: string | null;
    last: string;
  };
  meta: {
    totalItems: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
  };
}
