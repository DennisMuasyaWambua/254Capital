import React from 'react';
interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}
export function Table<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available'
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, index) =>
            <th
              key={index}
              scope="col"
              className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${col.className || ''}`}>

                {col.header}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {data.length > 0 ?
          data.map((item, rowIndex) =>
          <tr
            key={keyExtractor(item)}
            onClick={() => onRowClick && onRowClick(item)}
            className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}
                  ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                `}>

                {columns.map((col, colIndex) =>
            <td
              key={colIndex}
              className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">

                    {typeof col.accessor === 'function' ?
              col.accessor(item) :
              item[col.accessor] as React.ReactNode}
                  </td>
            )}
              </tr>
          ) :

          <tr>
              <td
              colSpan={columns.length}
              className="px-6 py-12 text-center text-slate-500">

                {emptyMessage}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>);

}