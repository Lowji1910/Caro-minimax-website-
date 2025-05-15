1. Mở Command Prompt
Nhấn Win + R, gõ cmd rồi nhấn Enter, hoặc

Nhấn Start, gõ “Command Prompt” và chọn ứng dụng.

2. Chuyển đến thư mục dự án
Giả sử bạn đã lưu dự án ở đường dẫn:
C:\Users\PC\Project\caro-ai
Trong cửa sổ CMD, gõ:
cd C:\Users\PC\Project\caro-ai
Rồi nhấn Enter để vào thư mục.

3. Tạo và kích hoạt môi trường ảo
Việc dùng môi trường ảo (virtual environment) giúp tách biệt các gói Python:

Tạo môi trường ảo:

python -m venv venv
(Nếu lệnh python không chạy, thử py -3 -m venv venv)

Kích hoạt môi trường:

venv\Scripts\activate
Sau khi activate, bạn sẽ thấy tiền tố (venv) xuất hiện trước dấu nhắc lệnh.

4. Cài đặt Flask
Với môi trường ảo đang kích hoạt, cài Flask bằng pip:

pip install Flask
Bạn sẽ thấy pip tải và cài đặt Flask cùng các phụ thuộc.

5. Chạy ứng dụng
Trong thư mục gốc (vẫn đang có (venv) trước dấu nhắc):

python app.py
Hoặc nếu dùng launcher:

py app.py
Nếu thành công, CMD sẽ hiển thị tương tự:

 * Serving Flask app "app.py"
 * Debug mode: on
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
6. Mở trò chơi trong trình duyệt
Mở Chrome/Edge/Firefox và truy cập:

http://127.0.0.1:5000
Giao diện Caro sẽ hiện ra, bạn chỉ việc chọn phe và bắt đầu chơi.

7. Kết thúc ứng dụng
Khi muốn dừng server, quay lại cửa sổ CMD và nhấn Ctrl +C.

Lưu ý thêm
Mỗi khi mở lại CMD, bạn cần kích hoạt lại môi trường ảo (venv\Scripts\activate) trước khi chạy python app.py.

Nếu muốn “dọn” môi trường, gõ deactivate để tắt venv.

Chúc bạn thành công!