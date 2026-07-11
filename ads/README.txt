Đặt file video quảng cáo (.mp4) vào thư mục này.

Sau đó mở file ads.js ở gốc dự án, thêm đường dẫn vào mảng AD_VIDEOS, ví dụ:

const AD_VIDEOS = [
  "/ads/ad1.mp4",
];

Gợi ý cho video mượt trên mọi trình duyệt:
- Định dạng: .mp4, mã hóa H.264
- Thời lượng: 10-20 giây là hợp lý
- Dung lượng: càng nhẹ càng tốt (dưới 5MB) để load nhanh, không làm người chơi khó chịu

Có thể thêm nhiều video, web sẽ chọn ngẫu nhiên 1 video mỗi lần hiện quảng cáo.
