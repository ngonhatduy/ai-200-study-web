# Azure AI-200 Interactive Study Portal & Exam Simulator (Vue 3)

Ứng dụng web tương tác hoàn chỉnh cho kỳ thi chứng chỉ **Microsoft Certified: Azure AI Cloud Developer Associate (AI-200)**, được xây dựng từ tài liệu [AI-200-complete-study-guide.md](../AI-200-complete-study-guide.md).

---

## 🌟 Các tính năng chính

1. **Dashboard Tổng quan & Đo lường Sẵn sàng**:
   - Tóm tắt thông tin kỳ thi (Mã: AI-200, Điểm đỗ: 700/1000, 120 phút, Mục tiêu sẵn sàng: 95%).
   - Tỷ trọng 4 Domain chuẩn Microsoft (Domain 1: 20-25%, Domain 2: 25-30%, Domain 3: 20-25%, Domain 4: 20-25%).
   - Đồng hồ đo mức độ hoàn thành và lịch sử làm bài thi.

2. **Trình đọc Tài liệu Thông minh (Interactive Study Guide Reader)**:
   - Toàn bộ 4,287 dòng tài liệu được chia thành 23 chương mục rõ ràng.
   - Hỗ trợ Markdown đầy đủ, bảng so sánh và khối mã nguồn kèm nút **Sao chép 1 chạm**.
   - Bộ lọc theo Domain và tìm kiếm toàn văn bản (Full-text Search).
   - Đánh dấu trạng thái đã đọc từng mục (lưu tự động vào LocalStorage).

3. **Hệ thống Thi thử & Luyện tập (178 câu hỏi mô phỏng)**:
   - **Full 120-Minute Simulation (60 câu hỏi F01 - F60)**: Đồng hồ đếm ngược 120 phút thời gian thực, bảng điều hướng 60 câu hỏi, cờ đánh dấu câu hỏi cần xem lại, tính điểm theo thang điểm 1000 của Microsoft (ngưỡng đỗ 700), biểu đồ phân tích điểm theo từng Domain và pháo hoa chúc mừng khi đạt.
   - **Practice Test A (20 câu)** & **Practice Test B (20 câu)**: Đề thi tính giờ 45 phút.
   - **Luyện tập theo Domain (36 câu)**: Chế độ ôn thi xem giải thích và đáp án ngay lập tức.
   - Toàn bộ câu hỏi đi kèm giải thích vì sao chọn đáp án đúng và vì sao loại các phương án gây nhiễu (distractors).

4. **42 Tình huống Thực chiến (Scenario Drills & Deep-Audit)**:
   - Các kịch bản chẩn đoán lỗi thực tế: Port mismatch, KEDA scale worker, Hot partition, Rollback revisions, Tracing.
   - Nút bật/mở lời giải và kiến trúc đối chiếu.
   - Đánh dấu các tình huống đã nắm vững.

5. **Bảng Quyết định Dịch vụ & Trợ lý Kiến trúc (Architecture Advisor)**:
   - Bảng so sánh chuyên sâu từ Section 9: Compute (Container Apps vs AKS vs App Service), Vector DBs (Cosmos DB vs PostgreSQL pgvector vs Redis), Messaging (Service Bus Queues vs Topics vs Event Grid), Secrets vs Configuration.
   - **AI Architecture Advisor**: Trả lời nhanh 3 câu hỏi về nhu cầu để nhận gợi ý dịch vụ Azure chuẩn mực.

6. **Tra cứu Cú pháp CLI, SDK, SQL & KQL (Cheatsheet)**:
   - Bộ mẫu code từ Section 11 & 11.1: Azure CLI (`az acr`, `az containerapp`), Python Azure SDK (`CosmosClient`, `DefaultAzureCredential`), SQL/pgvector (`<=>`, HNSW), KQL truy vấn Application Insights & Log Analytics.
   - Tìm kiếm nhanh và sao chép mã nguồn tiện lợi.

7. **Bộ Flashcard Thuật ngữ Cốt lõi (Core Vocabulary)**:
   - 31 thuật ngữ chuyên sâu (KEDA, DiskANN, RAG, Semantic Cache, Partition Key, Traces, Spans...).
   - Hiệu ứng lật thẻ 3D trực quan và chế độ xem danh sách.

8. **Cổng Kiểm tra Mức độ Sẵn sàng 95% & Lịch Học (Readiness Gate & Study Plan)**:
   - Danh sách kiểm tra năng lực (Mastery Checklist) cho từng Domain.
   - Lộ trình học 4 tuần với các đầu việc cụ thể mỗi ngày.

9. **Giao diện & Trải nghiệm**:
   - Thiết kế hiện đại theo phong cách Azure Cloud / Fluent Design.
   - Hỗ trợ chuyển đổi giao diện Sáng / Tối (Dark / Light mode).
   - Tự động lưu tiến độ vào LocalStorage, hỗ trợ đặt lại dữ liệu khi cần.

---

## 🚀 Hướng dẫn Chạy Ứng dụng

### 1. Khởi động môi trường phát triển (Dev Server)
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:5173`

### 2. Build ứng dụng sản xuất (Production Build)
```bash
npm run build
```
Thư mục xuất bản: `dist/`

### 3. Xem trước bản build
```bash
npm run preview
```

### 4. Cập nhật lại dữ liệu từ file markdown
Nếu bạn chỉnh sửa file `AI-200-complete-study-guide.md`, chỉ cần chạy:
```bash
npm run parse
npm run build
```
