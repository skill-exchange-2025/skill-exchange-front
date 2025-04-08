import { Button } from '@/components/ui/button';


export const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center gap-2">
        <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
        >
            Previous
        </Button>
        <span className="flex items-center px-4">
      Page {currentPage} of {totalPages}
    </span>
        <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
        >
            Next
        </Button>
    </div>
);