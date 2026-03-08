# Hướng Dẫn Kéo (Deploy) Bot Lên Server Miễn Phí Chạy 24/7

Để bot luôn hoạt động mà bạn không cần phải bật máy tính, chúng ta sẽ đưa bộ code này lên nền tảng đám mây (Cloud). Với server nhỏ chỉ có 2 người, ưu tiên số 1 là **miễn phí hoàn toàn**. 

Dưới đây là so sánh và hướng dẫn chi tiết cho hai nền tảng tốt nhất hiện nay: **Koyeb** và **Render**.

---

## ⚖️ SO SÁNH KOYEB VÀ RENDER

| Tính Năng | Koyeb 🚀 (Khuyên dùng) | Render 🐢 |
| :--- | :--- | :--- |
| **Giấc ngủ (Sleep)** | Không bị ngủ. Chạy liên tục 24/7 liền mạch. | Bị ngủ sau 15 phút không hoạt động. Mất 30s-1p để thức dậy. |
| **Bypass Sleep** | Không cần làm gì thêm. | Phải cài thêm UptimeRobot/CronJob để tự động gọi (ping) mỗi lúc. |
| **Yêu cầu thẻ tín dụng**| **Có**. Cần thêm thẻ Visa/Mastercard để xác minh (không trừ tiền). | **Không**. Đăng ký là dùng ngay. |
| **Độ khó cài đặt** | Cực dễ. | Phải cấu hình mẹo tránh "ngủ đông". |

**🔔 KẾT LUẬN:** 
- Nếu bạn có thẻ thanh toán quốc tế (Visa/Mastercard) -> **Chọn KOYEB** cho mượt mà.
- Nếu bạn học sinh/sinh viên, không có thẻ -> **Chọn RENDER**. (Bot của mình đã được tích hợp sẵn một máy chủ tí hon tên là "Express" ở cổng 3000 để giúp qua mặt cơ chế ngủ của Render).

---

## 🛠️ PHẦN 1: TẠO BOT TRÊN DISCORD

Dù chọn Koyeb hay Render, bạn đều phải tạo bot trước để lấy `DISCORD_TOKEN`.

1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications).
2. Bấm **"New Application"** góc trên bên phải, đặt tên là `Capoo Bot` và tích đồng ý điều khoản.
3. Bên menu tay trái, chọn mục **"Bot"**.
   - Bấm **"Reset Token"**, sau đó COPY đoạn mã dài ngoằng đó lại. ĐÂY LÀ `DISCORD_TOKEN`. Giữ bí mật tuyệt đối.
   - Kéo xuống mục **Privileged Gateway Intents**, bật cả 3 công tắc lên (Presence, Server Members, Message Content Intents) và bấm **Save Changes**.
4. Mời Bot vào server của bạn:
   - Qua mục **"OAuth2" -> "URL Generator"**.
   - Tích vào ô `bot`.
   - Ở mục *Bot Permissions* hiện ra bên dưới, tích vào `Administrator` (Hoặc tối thiểu cần: Send Messages, Manage Messages, Manage Webhooks).
   - Copy đường link ở dưới cùng, dán vào trình duyệt, và chọn Server 2 người của bạn để thêm bot vào!

---

## 🚀 PHẦN 2: DEPLOY LÊN KOYEB (CÁCH 1)

**Chuẩn bị:** Bạn cần đẩy thư mục code này lên một repository trên **GitHub** của bạn (Private hay Public đều được).

1. Truy cập [Koyeb.com](https://www.koyeb.com/) và tạo tài khoản, liên kết thẻ ngân hàng (chỉ để xác thực).
2. Ở Dashboard, chọn **"Create Service"**.
3. Chọn **GitHub** -> Kết nối tài khoản GitHub của bạn và chọn Repository chứa code này.
4. Tuỳ chỉnh cấu hình (Builder):
   - Chọn **Buildpacks**.
5. Kéo xuống mục **Environment variables**: Bấm *Add variable*.
   - Khung trái (Key) điền: `DISCORD_TOKEN`
   - Khung phải (Value) điền: `Mã token của bạn copy ở Phần 1`.
6. Kéo xuống mục **Instance**: Chọn Free (EcoFree, 512MB RAM).
7. Đặt tên App và nhấn **Deploy**.
8. Đợi khoảng 2-3 phút, kiểm tra log. Bot hiển thị "Capoo đã sẵn sàng!" là thành công 100%.

---

## 🐢 PHẦN 3: DEPLOY LÊN RENDER (CÁCH 2)

**Chuẩn bị:** Bạn cũng cần đưa code lên **GitHub** trước.

1. Truy cập [Render.com](https://render.com/), đăng ký bằng GitHub.
2. Bấm **"New +" -> "Web Service"**.
3. Chọn mục "Build and deploy from a Git repository", sau đó chọn Repository của bạn.
4. Cấu hình Render:
   - **Name:** capoo-bot
   - **Environment:** Node
   - **Build Command:** `npm install` (hoặc `yarn`)
   - **Start Command:** `npm start` (hoặc `node index.js`)
   - **Instance Type:** Chọn gói `Free`.
5. Bấm vào **Advanced**, thêm biến môi trường (Add Environment Variable):
   - **Key:** `DISCORD_TOKEN` | **Value:** `Token Phần 1 của bạn`
6. Nhấn **"Create Web Service"**.
7. Chờ bot Build xong. Bạn sẽ thấy đường link web góc trên cùng bên trái. (ví dụ: `https://capoo-bot.onrender.com`). Hãy ấn vào, nếu thấy chữ "Bot is ALIVE!" là OK.

**🌟 MẸO GIỮ BOT KHÔNG NGỦ ƯƠNG (RENDER):**
1. Copy đường link web của bạn (VD: `https://capoo-bot.onrender.com`).
2. Vào trang [cron-job.org](https://cron-job.org/) tạo tài khoản.
3. Tạo 1 Job mới (Create Cronjob).
4. Dán link Web Render của bạn vào ô URL.
5. Cài đặt Execution schedule là mỗi **10 phút** một lần (Every 10 minutes).
6. Bấm Save. Như vậy, Cron-job sẽ "cù lét" bot của bạn mỗi 10 phút, giúp nó không bao giờ chợp mắt!

---
*Chúc bạn và bạn kia có những khoảnh khắc vui vẻ cùng Capoo!*
