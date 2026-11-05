import React from "react";
import {
  BookOpenCheck,
  Calculator,
  FileCheck2,
  GitBranch,
  Landmark,
  Newspaper,
  Scale,
  ShieldCheck,
} from "lucide-react";
import ProceduresHub from "@/components/ProceduresHub";
import FeeCalculator from "@/components/FeeCalculator";
import LegalNewsSection from "@/components/LegalNewsSection";
import proceduresData from "../../data/procedures.json";
import legalNewsData from "../../data/legal_news.json";
import type { LegalNewsItem, Procedure } from "@/types/legal";

export default function HomePage() {
  const procedures = proceduresData as Procedure[];
  const news = legalNewsData as LegalNewsItem[];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-amber-400 shadow-sm">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-slate-900">
                TRA CỨU THỦ TỤC NHÀ ĐẤT
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Luật Đất đai 2024 &bull; Nghị định 101/2024/NĐ-CP &bull; Tự động hóa dữ liệu
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
            <a
              href="#cam-nang-thu-tuc"
              className="inline-flex items-center gap-1.5 hover:text-amber-600"
            >
              <BookOpenCheck className="h-4 w-4 text-amber-600" />
              Cẩm nang & Checklist
            </a>
            <a
              href="#tinh-thue-phi"
              className="inline-flex items-center gap-1.5 hover:text-amber-600"
            >
              <Calculator className="h-4 w-4 text-emerald-600" />
              Tính Thuế & Phí
            </a>
            <a
              href="#tin-tuc-phap-luat"
              className="inline-flex items-center gap-1.5 hover:text-amber-600"
            >
              <Newspaper className="h-4 w-4 text-amber-600" />
              Tin Pháp Luật ({news.length})
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/30">
                <ShieldCheck className="h-4 w-4" />
                Hệ thống tra cứu chuẩn hóa theo Luật Đất đai 2024
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                TRA CỨU THỦ TỤC NHÀ ĐẤT
              </h1>
              <p className="mt-2 text-lg font-semibold text-amber-300">
                Cổng Cẩm Nang Thủ Tục Đất Đai, Sổ Đỏ &amp; Thừa Kế
              </p>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
                Hướng dẫn chi tiết hồ sơ công chứng, lộ trình liên thông Một cửa &ndash; Thuế, công cụ ước tính Thuế TNCN (2%), Lệ phí trước bạ (0.5%) và điểm tin văn bản pháp luật cập nhật tự động hàng ngày.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#cam-nang-thu-tuc"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-400"
                >
                  <FileCheck2 className="h-4 w-4" />
                  Tra cứu Checklist Hồ sơ
                </a>
                <a
                  href="#tinh-thue-phi"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  <Calculator className="h-4 w-4 text-amber-400" />
                  Tính Thuế & Phí Sang Tên
                </a>
              </div>
            </div>

            {/* Key Metrics Card */}
            <div className="grid grid-cols-2 gap-3 lg:col-span-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/70 p-4">
                <Landmark className="h-6 w-6 text-amber-400" />
                <div className="mt-2 text-2xl font-extrabold text-white">
                  {procedures.length} Nhóm
                </div>
                <div className="text-xs text-slate-400">
                  Thủ tục trọng tâm (Mua bán, Thừa kế, Tặng cho, Cấp đổi, Tranh chấp)
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/70 p-4">
                <Calculator className="h-6 w-6 text-emerald-400" />
                <div className="mt-2 text-2xl font-extrabold text-white">
                  2% &amp; 0.5%
                </div>
                <div className="text-xs text-slate-400">
                  Tự động tính Thuế TNCN, Trước bạ &amp; xét miễn thuế nhân thân
                </div>
              </div>
              <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-800/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <GitBranch className="h-4 w-4" />
                    GitHub Actions CI/CD Scraper
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                    cron: 0 23 * * *
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-300">
                  Tự động thu thập bài viết mới lúc 06:00 sáng (GMT+7) và lưu vào{" "}
                  <code className="text-amber-300">data/legal_news.json</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        <ProceduresHub procedures={procedures} />
        <FeeCalculator />
        <LegalNewsSection news={news} />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} Cổng Cẩm Nang Thủ Tục Đất Đai &amp; Thừa Kế. Xây dựng trên Next.js 14 App Router &amp; GitHub Actions.
          </p>
          <p className="text-slate-400">
            Thông tin mang tính chất tham khảo nghiệp vụ hành chính theo Luật Đất đai 2024.
          </p>
        </div>
      </footer>
    </div>
  );
}
