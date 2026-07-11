// Danh sách video quảng cáo tự tải lên (không cần AdSense/tài khoản gì cả).
// Đặt file .mp4 vào thư mục /ads/ rồi thêm đường dẫn vào mảng dưới đây.
// Để trống mảng = tắt quảng cáo hoàn toàn.
const AD_VIDEOS = [
  // "/ads/ad1.mp4",
  // "/ads/ad2.mp4",
];

// Cứ mở game lần thứ N (N, 2N, 3N...) thì chèn 1 quảng cáo trước khi vào game.
const AD_EVERY_N_PLAYS = 5;
