// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { IFeedback } from "@/types/feedback.types";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export const columns: ColumnDef<IFeedback>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <span className="font-medium">{row.getValue('title')}</span>
        )
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <span className="text-muted-foreground line-clamp-2">
                {row.getValue('description')}
            </span>
        )
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.getValue('type')}
            </Badge>
        )
    },
    {
        accessorKey: "priority",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4"
            >
                Priority
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const priority = row.getValue('priority');
            const variant = {
                1: 'destructive',
                2: 'warning',
                3: 'default'
            }[priority] as 'destructive' | 'warning' | 'default';

            return (
                <Badge variant={variant}>
                    {['High', 'Medium', 'Low'][Number(priority) - 1]}
                </Badge>
            )
        }
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-4"
            >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <Badge variant={row.getValue('status') === 'open' ? 'outline' : 'secondary'}>
                {String(row.getValue('status')).toUpperCase()}
            </Badge>
        )
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy - HH:mm'),
        enableSorting: true
    },
    {
        id: "actions",
        // eslint-disable-next-line no-empty-pattern
        cell({}) {
            return <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4"/>
                </Button>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4 text-primary"/>
                </Button>
                <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive"/>
                </Button>
            </div>;
        },
    }
];