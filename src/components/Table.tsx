import Image from "next/image";

interface TableProps {
  headers: string[];
  data: { [key: string]: any }[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onRowClick?: (row: any) => void;
}

export function Table({ headers, data, onEdit, onDelete, onRowClick }: TableProps) {
  const truncateText = (text: string, maxLength: number = 30) =>
    text?.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  const renderCellContent = (header: string, row: any) => {
    switch (header) {
      case "Image":
        return row.image ? (
          <a
            href={row.image}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {truncateText(row.location)}
          </a>
        ) : (
          "-"
        );

      case "Google Map":
        return row.map_url ? (
          <a
            href={row.map_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Map
          </a>
        ) : (
          "-"
        );

      case "Article Link":
        return row.link ? (
          <a
            href={row.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {truncateText(row.source)}
          </a>
        ) : (
          "-"
        );

      case "Article Image":
        return row.image ? (
          <a
            href={row.image}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {truncateText(row.source)}
          </a>
        ) : (
          "-"
        );

      case "Movies":
        if (row.movies?.length) {
          // Map each movie to its clickable link.
          const movieLinks = row.movies.map((movie: any, i: number) => (
            <a
              key={i}
              href={movie.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {truncateText(movie.name)}
            </a>
          ));
          // Intersperse " || " between movie links.
          const interleaved = movieLinks.reduce((acc: React.ReactNode[], curr: React.ReactNode, index: number) => {
            if (index !== 0) {
              acc.push(" || ");
            }
            acc.push(curr);
            return acc;
          }, []);
          return <span>{interleaved}</span>;
        } else {
          return "-";
        }

      case "Status":
        {
          const status = row.status || "-";
          let badgeClass = "bg-gray-200 text-gray-800";
          if (status.toLowerCase() === "new") {
            badgeClass = "bg-green-100 text-green-800";
          } else if (status.toLowerCase() === "contacted") {
            badgeClass = "bg-blue-100 text-blue-800";
          } else if (status.toLowerCase() === "qualified") {
            badgeClass = "bg-purple-100 text-purple-800";
          } else if (status.toLowerCase() === "nurturing") {
            badgeClass = "bg-yellow-100 text-yellow-800";
          } else if (status.toLowerCase() === "closed") {
            badgeClass = "bg-red-100 text-red-800";
          }
          return (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeClass}`}>
              {status}
            </span>
          );
        }

      case "Actions":
        return (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(row);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              {/* Edit (pencil) icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487a2.25 2.25 0 113.182 3.182L7.5 21.5H4v-3.5L16.862 4.487z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(row);
              }}
              className="text-red-600 hover:text-red-800"
            >
              {/* Delete (trash) icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
                />
              </svg>
            </button>
          </div>
        );

      default:
        // For the "Email" column, use a smaller maxLength
        if (header.toLowerCase() === "email") {
          return (
            <span title={row[header.toLowerCase()] || ""}>
              {truncateText(row[header.toLowerCase()] || "-", 20)}
            </span>
          );
        }
        return (
          <span title={row[header.toLowerCase()] || ""}>
            {truncateText(row[header.toLowerCase()] || "-")}
          </span>
        );
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            {headers.map((header, index) => (
              <th key={index} className="p-4 text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="p-4">
                  {renderCellContent(header, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
