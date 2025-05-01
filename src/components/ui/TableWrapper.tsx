import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Input} from "@/components/ui/input";
import {flexRender, getCoreRowModel, getFilteredRowModel, useReactTable,} from "@tanstack/react-table";
import {useState} from "react";

interface TableWrapperProps {
    columns: never[];
    data: never[];
    searchKey?: string;
}

export function TableWrapper({ columns, data, searchKey }: TableWrapperProps) {
    const [globalFilter, setGlobalFilter] = useState("");

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
        },
        globalFilterFn: (row, _columnId, filterValue) => {
            if (!searchKey) return true;
            const value = row.getValue(searchKey);
            return String(value).toLowerCase().includes(filterValue.toLowerCase());
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="space-y-4">
            {searchKey && (
                <Input
                    placeholder={`Search by ${searchKey}`}
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full md:w-1/3"
                />
            )}
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
