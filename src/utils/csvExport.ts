/**
 * Escape a CSV field if it contains special characters like commas, quotes, or newlines.
 * @param value The value to escape.
 * @returns The escaped string.
 */
export const escapeCsvField = (value: any): string => {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Generate CSV content from an array of objects and headers.
 * @param data Array of records.
 * @param headers Array of header names.
 * @param getRow Function to extract row values from a record.
 * @returns The CSV string.
 */
export const generateCsv = <T>(
  data: T[],
  headers: string[],
  getRow: (item: T) => any[]
): string => {
  const headerRow = headers.map(escapeCsvField).join(",");
  const bodyRows = data.map((item) => getRow(item).map(escapeCsvField).join(","));
  return [headerRow, ...bodyRows].join("\n");
};
