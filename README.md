# HanVietQuiz Web

Web app tĩnh dạng SPA, lấy cảm hứng từ luồng học của các nền tảng quiz hiện đại.

## Chạy local

```powershell
cd D:\Python\hanvietquiz_web
python -m http.server 8080
```

Sau đó mở http://localhost:8080.

Trạng thái học, lịch, điểm XP và cài đặt được lưu bằng `localStorage`.

## Đăng nhập Google

App dùng Google Identity Services cho web tĩnh. Tạo OAuth Client ID tại Google Cloud Console, loại **Web application**, rồi thay giá trị trong `index.html`:

```html
<meta name="google-signin-client_id" content="YOUR_CLIENT_ID.apps.googleusercontent.com">
```

Authorized JavaScript origins nên có:

```text
http://localhost:8000
http://localhost:8080
https://TEN_GITHUB_CUA_BAN.github.io
```

Nếu deploy theo repository project, ví dụ `https://TEN_GITHUB_CUA_BAN.github.io/hanvietquiz/`, origin vẫn chỉ là `https://TEN_GITHUB_CUA_BAN.github.io`.

## Đưa lên GitHub Pages

1. Tạo repository trên GitHub.
2. Upload hoặc push toàn bộ thư mục `hanvietquiz_web`.
3. Vào **Settings > Pages**.
4. Chọn **Deploy from a branch**, branch `main`, folder `/root` nếu repo chỉ chứa app này.
5. Link web sẽ có dạng `https://TEN_GITHUB_CUA_BAN.github.io/TEN_REPO/`.
