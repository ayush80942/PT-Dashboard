import Image from "next/image";

interface TableProps {
  headers: string[];
  data: {
    [key: string]: any;
  }[];
}

export function Table({ headers, data }: TableProps) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            {headers.map((header, index) => (
              <th key={index} className="p-4 text-left">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-gray-50">
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="p-4">
                  {header === "Image" && row.image ? (
                    <a href={row.image} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {row.image}
                    </a>
                  ) : header === "Google Map" && row.map_url ? (
                    <a href={row.map_url} className="text-blue-500 underline" target="_blank">
                      View Map
                    </a>
                  ) : header === "Movies" && row.movies ? (
                    <div className="flex flex-wrap gap-2">
                      {row.movies.map((movie: any, i: number) => (
                        <div key={i} className="flex items-center space-x-2">

                          <a href={movie.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {movie.link}
                          </a>

                          <span>{movie.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    row[header.toLowerCase()]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
