/**
 * Defines the parameters for pagination.
 */
export interface PaginationOptions {
  page?: number; 
  limit?: number; 
}

/**
 * Defines the structure for a paginated response.
 * @template T The type of the items in the results array.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}