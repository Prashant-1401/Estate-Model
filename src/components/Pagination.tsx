"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  showPageSizeSelector = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#E2E8F0]">
      <div className="text-sm text-[#64748B]">
        Showing <span className="font-medium text-[#0F172A]">{startItem}</span> to{" "}
        <span className="font-medium text-[#0F172A]">{endItem}</span> of{" "}
        <span className="font-medium text-[#0F172A]">{totalItems}</span> projects
      </div>

      <div className="flex items-center gap-2">
        {showPageSizeSelector && onPageSizeChange && (
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={cn(
              "p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              currentPage === 1
                ? "bg-[#F8FAFC] text-[#CBD5E1]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            )}
            aria-label="First page"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              currentPage === 1
                ? "bg-[#F8FAFC] text-[#CBD5E1]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {pageNumbers.map((page, i) =>
            page === "..." ? (
              <span key={`ellipsis-${i}`} className="px-3 text-[#64748B]">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "min-w-[36px] h-9 rounded-xl text-sm font-medium transition-all",
                  currentPage === page
                    ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/20"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                )}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              currentPage === totalPages
                ? "bg-[#F8FAFC] text-[#CBD5E1]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            )}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={cn(
              "p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              currentPage === totalPages
                ? "bg-[#F8FAFC] text-[#CBD5E1]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            )}
            aria-label="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}