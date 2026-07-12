import { cn } from "@/lib/utils";

type AdminListTableProps = {
  headers: string[];
  children: React.ReactNode;
  className?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
};

export function AdminListTable({
  headers,
  children,
  className,
  emptyMessage = "No items yet.",
  isEmpty = false,
}: AdminListTableProps) {
  if (isEmpty) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)}>
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-3 py-2.5 font-medium text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
