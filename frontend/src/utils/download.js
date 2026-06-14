import * as XLSX from "xlsx";

/**
 * Hàm xuất file Excel dùng chung cho toàn hệ thống
 * @param {string} title - Tiêu đề lớn của phiếu
 * @param {Array<string>} metaLines - Mảng các dòng thông tin phụ (Kho, Khách hàng, ngày tháng...)
 * @param {Array<string>} headers - Tiêu đề của các cột trong bảng
 * @param {Array<Array>} dataRows - Mảng hai chiều chứa dữ liệu các dòng hàng
 * @param {string} totalLabel - Nhãn của dòng tổng tiền (ví dụ: "Tổng doanh thu đơn xuất:")
 * @param {number} totalValue - Con số tổng tiền cụ thể
 * @param {string} fileNamePrefix - Tên file muốn tải về (ví dụ: "Hoa_Don_Xuat_Kho")
 */
export const exportToExcel = (title, metaLines, headers, dataRows, totalLabel, totalValue, fileNamePrefix) => {
  // 1. Khởi tạo mảng hàng cột thô cho Excel
  const rows = [
    [title],
    ...metaLines.map(line => [line]), // Duyệt qua các dòng thông tin phụ
    [], // Hàng trống ngăn cách
    headers, // Tiêu đề cột
    ...dataRows, // Đổ toàn bộ dữ liệu hàng hóa vào đây
    [] // Hàng trống trước khi tính tổng
  ];

  // 2. Tính toán vị trí cột cuối cùng để đặt con số Tổng tiền cho đẹp mắt
  const totalRow = new Array(headers.length).fill("");
  totalRow[0] = totalLabel;
  totalRow[headers.length - 1] = totalValue; // Đặt con số tổng tiền ở cột cuối cùng
  rows.push(totalRow);

  // 3. Đóng gói và tạo file Excel tải về máy
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ChungTuKho");
  
  XLSX.writeFile(workbook, `${fileNamePrefix}_${Date.now()}.xlsx`);
};