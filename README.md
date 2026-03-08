# Bugcat Capoo Discord Bot

Một bot thay thế Emoji động bằng Webhooks cho các máy chủ Discord không có Nitro. Gói Emoji tập trung vào Bugcat Capoo cực kỳ dễ thương!

## Tính năng
- Gọi emoji thông qua các tags đơn giản: `:capoo_love:`, `:capoo_cry:`, ...
- Tự động thay thế tin nhắn gốc của người dùng bằng một Webhook mang tên và ảnh đại diện y hệt, tạo cảm giác như chính bạn gửi Emoji động đó!
- Tích hợp thêm máy chủ Web tí hon bằng Express.js để có thể deploy miễn phí trên Render mà không bị ngủ đông.

## Hướng dẫn cài đặt & Deploy miễn phí 24/7
👉 Xem TẤT TẦN TẬT tại [Huong_Dan_Deploy.md](./Huong_Dan_Deploy.md).

## Cấu trúc thư mục
- `index.js`: Nơi chứa code logic của bot.
- `gifs.json`: File cấu hình, bạn có thể tự thêm các link ảnh GIF theo ý thích vào đây.
- `package.json`: Chứa các thư viện Node.js cần thiết.
- `.env`: (Bạn phải tự tạo từ `.env.example`) Nơi chứa Token của Bot.

---
Được xây dựng theo hướng dẫn từ ChatGPT. Happy chatting! 🐾
