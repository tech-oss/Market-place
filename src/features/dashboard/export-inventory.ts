import { LISTING_STATUS_META } from "@/features/dashboard/status";
import { formatZAR } from "@/lib/format";
import type { SellerListing } from "@/types";
import type { CatalogCategory } from "@/lib/data/products";

const HEADER_FILL = "C0392B"; // brand red
const BAND_FILL = "F7F3EE"; // soft warm gray, matches site background tone
const BORDER = { style: "thin" as const, color: { argb: "FFDDDDDD" } };

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Exports every listing for the signed-in seller as a formatted .xlsx
 * workbook — done fully client-side against data already on the page (no
 * server round trip needed) with `exceljs` dynamically imported so it never
 * bloats the seller listings page's default bundle.
 */
export async function exportInventoryToExcel(
  listings: SellerListing[],
  categories: CatalogCategory[],
  sellerName: string,
) {
  const ExcelJS = (await import("exceljs")).default;
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Motorcycle Products";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Inventory", {
    views: [{ state: "frozen", ySplit: 4 }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  const columns: { header: string; key: string; width: number }[] = [
    { header: "Item #", key: "itemNumber", width: 14 },
    { header: "Barcode / SKU", key: "sku", width: 20 },
    { header: "Product Title", key: "title", width: 38 },
    { header: "Category", key: "category", width: 18 },
    { header: "Make", key: "make", width: 16 },
    { header: "Model", key: "model", width: 16 },
    { header: "Year Range", key: "years", width: 12 },
    { header: "Condition", key: "condition", width: 16 },
    { header: "Price (ZAR)", key: "price", width: 14 },
    { header: "Stock Qty", key: "stock", width: 11 },
    { header: "Status", key: "status", width: 16 },
    { header: "Views", key: "views", width: 9 },
    { header: "Sold", key: "sold", width: 9 },
    { header: "Date Listed", key: "listedAt", width: 14 },
  ];
  const colCount = columns.length;

  // --- Title block -----------------------------------------------------
  sheet.mergeCells(1, 1, 1, colCount);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = `${sellerName} — Inventory Export`;
  titleCell.font = { size: 16, bold: true, color: { argb: "FF1A1A1A" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 28;

  sheet.mergeCells(2, 1, 2, colCount);
  const subtitleCell = sheet.getCell(2, 1);
  const generated = new Date().toLocaleString("en-ZA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  subtitleCell.value = `Generated ${generated} · ${listings.length} listing${listings.length === 1 ? "" : "s"}`;
  subtitleCell.font = { size: 10, italic: true, color: { argb: "FF666666" } };
  sheet.getRow(2).height = 18;

  sheet.getRow(3).height = 6; // spacer

  // --- Header row --------------------------------------------------------
  const headerRowIndex = 4;
  const headerRow = sheet.getRow(headerRowIndex);
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${HEADER_FILL}` } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
  });
  headerRow.height = 22;
  columns.forEach((col, i) => { sheet.getColumn(i + 1).width = col.width; });

  // --- Data rows -----------------------------------------------------
  listings.forEach((l, idx) => {
    const rowIndex = headerRowIndex + 1 + idx;
    const row = sheet.getRow(rowIndex);
    const meta = LISTING_STATUS_META[l.status];
    const values = [
      l.itemNumber,
      l.sku,
      l.title,
      categoryName.get(l.categorySlug) ?? l.categorySlug,
      l.brandName ?? l.fitment?.brand ?? "—",
      l.fitment?.model ?? "—",
      l.fitment?.yearFrom && l.fitment?.yearTo ? `${l.fitment.yearFrom}–${l.fitment.yearTo}` : "—",
      l.condition.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      l.priceCents / 100,
      l.stock,
      meta?.label ?? l.status,
      l.views,
      l.sold,
      new Date(l.createdAt).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" }),
    ];
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      cell.value = v as string | number;
      cell.border = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
      cell.alignment = { vertical: "middle", horizontal: i === 2 ? "left" : "center", wrapText: i === 2 };
      if (idx % 2 === 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BAND_FILL}` } };
    });
    row.getCell(9).numFmt = '"R"#,##0.00'; // Price column
    row.getCell(11).font = {
      bold: true,
      color: {
        argb:
          l.status === "active" ? "FF15803D" :
          l.status === "out-of-stock" ? "FFB91C1C" :
          l.status === "pending-review" || l.status === "awaiting-verification" ? "FFB45309" :
          "FF6B7280",
      },
    };
  });

  sheet.autoFilter = { from: { row: headerRowIndex, column: 1 }, to: { row: headerRowIndex, column: colCount } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${slugify(sellerName) || "seller"}-inventory-${dateStamp}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
