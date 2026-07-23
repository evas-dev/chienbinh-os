/**
 * Trừu tượng hóa nơi lưu tệp.
 *
 * Hiện chỉ có một triển khai là lưu vào đĩa máy này. Giữ interface để khi lên
 * VPS muốn chuyển sang S3/R2 thì chỉ viết thêm một lớp mới, KHÔNG phải đụng
 * vào tầng nghiệp vụ.
 */
export interface TepDauVao {
  tenGoc: string;
  loaiMime: string;
  duLieu: Buffer;
}

export interface KetQuaLuu {
  tenLuu: string;
  /** Đường dẫn TƯƠNG ĐỐI so với thư mục gốc lưu trữ — để copy sang máy khác vẫn chạy. */
  duongDan: string;
  kichThuoc: number;
}

export interface KhoLuuTru {
  luu(tep: TepDauVao): Promise<KetQuaLuu>;
  doc(duongDan: string): Promise<Buffer>;
  /** Không xóa hẳn mà chuyển vào thùng rác, phòng khi người dùng bấm nhầm. */
  chuyenVaoThungRac(duongDan: string): Promise<void>;
}
