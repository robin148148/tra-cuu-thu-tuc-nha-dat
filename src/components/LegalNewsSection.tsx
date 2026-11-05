"use client";

import React, { useMemo, useState } from "react";
import {
  Bot,
  Calendar,
  ExternalLink,
  Newspaper,
  RefreshCw,
  RotateCcw,
  Search,
  Tag,
  X,
} from "lucide-react";
import type { LegalNewsItem } from "@/types/legal";

interface LegalNewsSectionProps {
  news: LegalNewsItem[];
}

export default function LegalNewsSection({ news }: LegalNewsSectionProps) {
  const [articles, setArticles] = useState<LegalNewsItem[]>(news);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshLiveNews = async () => {
    setIsRefreshing(true);
    try {
      // 1. Pull latest daily scraped JSON from GitHub repo
      const ghRes = await fetch(
        "https://raw.githubusercontent.com/robin148148/tra-cuu-thu-tuc-nha-dat/main/data/legal_news.json?t=" +
          Date.now()
      );
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (Array.isArray(ghData) && ghData.length > 0) {
          setArticles((prev) => {
            const existingUrls = new Set(prev.map((p) => p.sourceUrl));
            const newFromGh = ghData.filter(
              (item: LegalNewsItem) =>
                item?.sourceUrl && !existingUrls.has(item.sourceUrl)
            );
            return [...newFromGh, ...prev];
          });
        }
      }

      // 2. Also fetch live RSS items
      const res = await fetch(
        "https://api.rss2json.com/v1/api.json?rss_url=" +
          encodeURIComponent("https://vnexpress.net/rss/phap-luat.rss")
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.items && Array.isArray(data.items)) {
          const keywords = [
            "đất",
            "sổ đỏ",
            "sổ hồng",
            "thừa kế",
            "di chúc",
            "tặng cho",
            "chuyển nhượng",
            "nhà",
            "bất động sản",
            "thuế",
            "công chứng",
            "tranh chấp",
          ];
          const liveItems: LegalNewsItem[] = data.items
            .filter((it: { title?: string; description?: string }) => {
              const text = `${it.title ?? ""} ${it.description ?? ""}`.toLowerCase();
              return keywords.some((kw) => text.includes(kw));
            })
            .map(
              (
                it: {
                  title: string;
                  description?: string;
                  link: string;
                  pubDate?: string;
                },
                idx: number
              ) => ({
                id: `live-${idx}-${Date.now()}`,
                title: it.title,
                summary: (it.description || "")
                  .replace(/<[^>]+>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 280),
                sourceUrl: it.link,
                sourceName: "VnExpress Pháp Luật (Trực tiếp)",
                category: "Chính sách mới",
                publishedDate: (it.pubDate || "").slice(0, 10) || "Hôm nay",
                scrapedAt: new Date().toISOString(),
              })
            );

          if (liveItems.length > 0) {
            setArticles((prev) => {
              const existingUrls = new Set(prev.map((p) => p.sourceUrl));
              const uniqueNew = liveItems.filter(
                (li) => !existingUrls.has(li.sourceUrl)
              );
              return [...uniqueNew, ...prev];
            });
          }
        }
      }
    } catch {
      // Fallback silently to pre-scraped static JSON
    } finally {
      setIsRefreshing(false);
    }
  };

  const categories = useMemo(() => {
    const unique = Array.from(new Set(articles.map((item) => item.category)));
    return ["Tất cả", ...unique];
  }, [articles]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "Tất cả": articles.length };
    for (const item of articles) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [articles]);

  const filteredNews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return articles.filter((item) => {
      const matchCat =
        selectedCategory === "Tất cả" || item.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.sourceName ?? "").toLowerCase().includes(q)
      );
    });
  }, [articles, selectedCategory, searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    if (trimmed) {
      setSelectedCategory("Tất cả");
    }
  };

  const handleResetAll = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("Tất cả");
  };

  const handleSelectCategory = (cat: string) => {
    if (cat === "Tất cả") {
      setSearchInput("");
      setSearchQuery("");
      setSelectedCategory("Tất cả");
      return;
    }
    setSelectedCategory(cat);
  };

  const latestScrapeTime = useMemo(() => {
    const timestamps = articles
      .map((n) => n.scrapedAt)
      .filter(Boolean) as string[];
    if (timestamps.length === 0) return "Hôm nay (06:00 GMT+7)";
    timestamps.sort().reverse();
    return timestamps[0].replace("T", " ").slice(0, 16);
  }, [articles]);

  return (
    <section id="tin-tuc-phap-luat" className="scroll-mt-24 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-amber-400">
              <Bot className="h-3.5 w-3.5" />
              GitHub Actions Scraper &bull; Cập nhật tự động 06:00 sáng hàng ngày
            </div>
            <h2 className="mt-2 flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              <Newspaper className="h-7 w-7 text-amber-600" />
              Điểm Tin Pháp Luật Đất Đai & Văn Bản Mới
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Dữ liệu được thu thập tự động bởi{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-800">
                scripts/legal_scraper.py
              </code>{" "}
              từ các nguồn báo chí pháp luật chính thống và lưu tại{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-800">
                /data/legal_news.json
              </code>
              .
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Đồng bộ gần nhất: {latestScrapeTime}
            </div>
            <button
              type="button"
              onClick={refreshLiveNews}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-amber-400 transition hover:bg-slate-800 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Đang quét tin mới..." : "Làm mới trực tiếp"}
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => {
              const active =
                selectedCategory === cat &&
                (cat !== "Tất cả" || searchQuery.trim() === "");
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      active
                        ? "bg-white text-amber-900 font-bold"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full items-center gap-2 lg:w-96"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchInput(val);
                  setSearchQuery(val);
                }}
                placeholder="Lọc tin tức, nghị định, thông tư..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:bg-white focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  title="Xóa từ khóa"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700"
            >
              <Search className="h-3.5 w-3.5" />
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Articles Grid */}
        {filteredNews.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              Không tìm thấy bài viết nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={handleResetAll}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Hiện tất cả ({articles.length} bài viết)
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition-all hover:border-amber-400 hover:bg-white hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/80 px-2.5 py-0.5 font-semibold text-amber-900">
                      <Tag className="h-3 w-3" />
                      {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.publishedDate}
                    </span>
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-amber-700">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.title}
                    </a>
                  </h3>

                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs">
                  <span className="font-semibold text-slate-500">
                    {item.sourceName || "Nguồn Pháp Luật"}
                  </span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-800"
                  >
                    Xem toàn văn
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
