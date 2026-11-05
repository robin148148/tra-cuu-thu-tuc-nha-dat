# Cổng Cẩm Nang Thủ Tục Đất Đai & Thừa Kế (Vietnamese Land Law & Property Portal)

Cổng thông tin tra cứu thủ tục hành chính đất đai, thừa kế, tặng cho, cấp đổi Sổ đỏ/Sổ hồng, giải quyết tranh chấp theo **Luật Đất đai 2024** và **Nghị định 101/2024/NĐ-CP**, tích hợp công cụ tính thuế phí tự động và luồng thu thập tin tức pháp luật hàng ngày qua **GitHub Actions**.

## 1. Kiến trúc Hệ thống
- **Frontend & SSG:** Next.js 14 (App Router, TypeScript, Tailwind CSS, Lucide React) xuất tĩnh (`output: 'export'`).
- **Tầng dữ liệu JSON:**
  - `data/procedures.json`: Cẩm nang 5 nhóm thủ tục trọng tâm, checklist hồ sơ và lộ trình 4 bước hành chính.
  - `data/legal_news.json`: Điểm tin pháp luật và chính sách đất đai được cập nhật tự động.
- **Scraper Engine:** `scripts/legal_scraper.py` (`requests`, `beautifulsoup4`, `feedparser`).
- **GitHub Actions CI/CD:** `.github/workflows/scrape_and_deploy.yml` chạy tự động lúc `23:00 UTC` (`06:00 AM GMT+7`) mỗi ngày.

## 2. Hướng dẫn Chạy Dự án

### Chạy Scraper cập nhật dữ liệu tin tức
```bash
pip install -r requirements.txt
python scripts/legal_scraper.py
```

### Chạy Frontend & Build Production
```bash
npm install
npm run dev
# Hoặc kiểm tra xuất tĩnh Production:
npm run build
```
