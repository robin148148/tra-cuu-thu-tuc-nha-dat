"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  FileCheck2,
  Filter,
  Landmark,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
  Stamp,
  X,
} from "lucide-react";
import type { Procedure } from "@/types/legal";

const STORAGE_KEY = "land_law_portal_checklist_v1";

interface ProceduresHubProps {
  procedures: Procedure[];
}

export default function ProceduresHub({ procedures }: ProceduresHubProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [activeProcedureId, setActiveProcedureId] = useState<string>(
    procedures[0]?.id ?? ""
  );
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [showUncheckedOnly, setShowUncheckedOnly] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load checklist state from localStorage on client mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setCheckedMap(parsed);
        }
      }
    } catch {
      // ignore storage errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save checklist state to localStorage when modified
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedMap));
    } catch {
      // ignore storage errors
    }
  }, [checkedMap, isHydrated]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(procedures.map((p) => p.category)));
    return ["Tất cả", ...unique];
  }, [procedures]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "Tất cả": procedures.length };
    for (const proc of procedures) {
      counts[proc.category] = (counts[proc.category] || 0) + 1;
    }
    return counts;
  }, [procedures]);

  const filteredProcedures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return procedures.filter((proc) => {
      const matchCat =
        selectedCategory === "Tất cả" || proc.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      const inTitle = proc.title.toLowerCase().includes(q);
      const inCategory = proc.category.toLowerCase().includes(q);
      const inSummary = proc.summary.toLowerCase().includes(q);
      const inChecklist = proc.checklist.some(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.notes.toLowerCase().includes(q)
      );
      const inTimeline = proc.timeline.some(
        (st) =>
          st.title.toLowerCase().includes(q) ||
          st.description.toLowerCase().includes(q)
      );
      const inLaw = proc.legalBasis.some((law) =>
        law.toLowerCase().includes(q)
      );
      return (
        inTitle ||
        inCategory ||
        inSummary ||
        inChecklist ||
        inTimeline ||
        inLaw
      );
    });
  }, [procedures, searchQuery, selectedCategory]);

  const activeProcedure = useMemo(() => {
    return (
      filteredProcedures.find((p) => p.id === activeProcedureId) ||
      filteredProcedures[0] ||
      null
    );
  }, [filteredProcedures, activeProcedureId]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    // If searching with a keyword, automatically switch category to "Tất cả" so results across all categories appear
    if (trimmed) {
      setSelectedCategory("Tất cả");
    }
    const q = trimmed.toLowerCase();
    const firstMatch = procedures.find((proc) => {
      if (!q) return true;
      return (
        proc.title.toLowerCase().includes(q) ||
        proc.summary.toLowerCase().includes(q) ||
        proc.checklist.some((i) => i.name.toLowerCase().includes(q)) ||
        proc.legalBasis.some((l) => l.toLowerCase().includes(q))
      );
    });
    if (firstMatch) {
      setActiveProcedureId(firstMatch.id);
    }
  };

  const handleResetAll = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("Tất cả");
    setShowUncheckedOnly(false);
    if (procedures[0]) {
      setActiveProcedureId(procedures[0].id);
    }
  };

  const handleSelectCategory = (cat: string) => {
    if (cat === "Tất cả") {
      setSearchInput("");
      setSearchQuery("");
      setSelectedCategory("Tất cả");
      if (procedures[0]) {
        setActiveProcedureId(procedures[0].id);
      }
      return;
    }
    setSelectedCategory(cat);
    const firstMatch = procedures.find((p) => p.category === cat);
    if (firstMatch) {
      setActiveProcedureId(firstMatch.id);
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const resetCurrentProcedureChecklist = () => {
    if (!activeProcedure) return;
    setCheckedMap((prev) => {
      const next = { ...prev };
      for (const item of activeProcedure.checklist) {
        delete next[item.id];
      }
      return next;
    });
  };

  const checkAllCurrentProcedure = () => {
    if (!activeProcedure) return;
    setCheckedMap((prev) => {
      const next = { ...prev };
      for (const item of activeProcedure.checklist) {
        next[item.id] = true;
      }
      return next;
    });
  };

  const totalDocs = activeProcedure?.checklist.length ?? 0;
  const completedDocs =
    activeProcedure?.checklist.filter((item) => checkedMap[item.id]).length ??
    0;
  const progressPercent =
    totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

  const visibleChecklist = activeProcedure
    ? showUncheckedOnly
      ? activeProcedure.checklist.filter((item) => !checkedMap[item.id])
      : activeProcedure.checklist
    : [];

  return (
    <section id="cam-nang-thu-tuc" className="scroll-mt-24 space-y-6">
      {/* Section Header & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
              <Scale className="h-3.5 w-3.5" />
              Chuẩn hóa theo Luật Đất đai 2024 & Nghị định 101/2024/NĐ-CP
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Cẩm Nang Thủ Tục Đất Đai & Thừa Kế
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Tra cứu hồ sơ cần chuẩn bị, đánh dấu tiến độ (tự động lưu trên trình duyệt) và lộ trình 4 bước giải quyết hành chính.
            </p>
          </div>

          {/* Search Form with Explicit Search & Clear Buttons */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full items-center gap-2 lg:w-[460px]"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchInput(val);
                  setSearchQuery(val);
                }}
                placeholder="Tìm thủ tục, mẫu 11/ĐK, di chúc, sổ đỏ..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  title="Xóa từ khóa"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-[0.99]"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Filter className="h-3.5 w-3.5" /> Nhóm thủ tục:
            </span>
            {categories.map((cat) => {
              const isSelected =
                selectedCategory === cat &&
                (cat !== "Tất cả" || searchQuery.trim() === "");
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {(searchQuery.trim() !== "" || selectedCategory !== "Tất cả") && (
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Hiện tất cả ({procedures.length} thủ tục)
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Procedure Selector Sidebar + Detail Workspace */}
      <div
        ref={resultsRef}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        {/* Left Sidebar: Procedure List */}
        <div className="space-y-3 lg:col-span-4">
          <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500">
            <span>
              Danh sách thủ tục ({filteredProcedures.length}/{procedures.length})
            </span>
            {selectedCategory !== "Tất cả" && (
              <span className="text-amber-700">Lọc: {selectedCategory}</span>
            )}
          </div>

          {filteredProcedures.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="text-sm font-medium text-slate-700">
                Không tìm thấy thủ tục phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                type="button"
                onClick={handleResetAll}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Xem tất cả thủ tục
              </button>
            </div>
          ) : (
            filteredProcedures.map((proc) => {
              const isActive = activeProcedure?.id === proc.id;
              const procChecked = proc.checklist.filter(
                (i) => checkedMap[i.id]
              ).length;
              const procTotal = proc.checklist.length;

              return (
                <button
                  key={proc.id}
                  type="button"
                  onClick={() => setActiveProcedureId(proc.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? "border-amber-600 bg-amber-50/60 shadow-sm ring-1 ring-amber-600"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                      {proc.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        procChecked === procTotal && procTotal > 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <FileCheck2 className="h-3 w-3" />
                      {procChecked}/{procTotal} hồ sơ
                    </span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900">
                    {proc.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {proc.summary}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Right Detail Panel */}
        <div className="space-y-6 lg:col-span-8">
          {activeProcedure ? (
            <>
              {/* Overview Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-amber-400">
                    {activeProcedure.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    Thời hạn giải quyết:{" "}
                    <strong className="text-slate-800">
                      {activeProcedure.processingTime}
                    </strong>
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
                  {activeProcedure.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {activeProcedure.summary}
                </p>

                {/* Authority & Legal Basis */}
                <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <Building2 className="h-3.5 w-3.5 text-amber-600" />
                      Cơ quan có thẩm quyền
                    </div>
                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-800">
                      {activeProcedure.authority}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                      Căn cứ pháp lý hiện hành
                    </div>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-700">
                      {activeProcedure.legalBasis.map((law, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                          <span>{law}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Interactive Document Checklist with LocalStorage Persistence */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                      <FileCheck2 className="h-5 w-5 text-emerald-600" />
                      Checklist Hồ Sơ Cần Chuẩn Bị (Lưu Tự Động)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Đánh dấu từng giấy tờ bạn đã có sẵn. Trạng thái được lưu vào{" "}
                      <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] font-mono text-slate-700">
                        localStorage
                      </code>{" "}
                      để theo dõi nhiều ngày.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUncheckedOnly((v) => !v)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                        showUncheckedOnly
                          ? "border-amber-600 bg-amber-50 text-amber-800"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {showUncheckedOnly
                        ? "Hiện tất cả hồ sơ"
                        : "Chỉ hiện mục thiếu"}
                    </button>
                    <button
                      type="button"
                      onClick={checkAllCurrentProcedure}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Chọn tất cả
                    </button>
                    <button
                      type="button"
                      onClick={resetCurrentProcedureChecklist}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Đặt lại
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">
                      Tiến độ chuẩn bị hồ sơ: {completedDocs}/{totalDocs} tài liệu
                    </span>
                    <span
                      className={
                        progressPercent === 100
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }
                    >
                      {progressPercent}% hoàn tất
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progressPercent === 100
                          ? "bg-emerald-600"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Items */}
                <div className="mt-4 space-y-3">
                  {visibleChecklist.length === 0 ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-center text-xs font-medium text-emerald-800">
                      Tuyệt vời! Bạn đã chuẩn bị đầy đủ tất cả giấy tờ trong danh mục này.
                    </div>
                  ) : (
                    visibleChecklist.map((item) => {
                      const isChecked = !!checkedMap[item.id];
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                            isChecked
                              ? "border-emerald-200 bg-emerald-50/40"
                              : "border-slate-200 bg-white hover:border-amber-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              aria-label={`Đánh dấu ${item.name}`}
                              className="mt-0.5 shrink-0 text-slate-400 group-hover:text-emerald-600"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={`text-sm font-bold ${
                                    isChecked
                                      ? "line-through text-slate-500"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                                      item.mandatory
                                        ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {item.mandatory
                                      ? "Bắt buộc"
                                      : "Tùy trường hợp"}
                                  </span>
                                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                    {item.copies}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-1 text-xs text-slate-600">
                                {item.description}
                              </p>
                              <p className="mt-1.5 text-[11px] font-medium text-amber-800">
                                Lưu ý: {item.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Step-by-Step Administrative Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Stamp className="h-5 w-5 text-amber-600" />
                  Lộ Trình Hành Chính 4 Bước (Công Chứng &rarr; Một Cửa &rarr; Thuế &rarr; Trả Kết Quả)
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Quy trình chuẩn liên thông Một cửa điện tử và Cơ quan Thuế theo quy định hiện hành.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {activeProcedure.timeline.map((step) => (
                    <div
                      key={step.step}
                      className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-amber-400">
                            Bước {step.step}: {step.phase}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/80 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                            <Clock className="h-3 w-3" />
                            {step.duration}
                          </span>
                        </div>

                        <h5 className="mt-3 text-sm font-bold text-slate-900">
                          {step.title}
                        </h5>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          <Landmark className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
                          {step.agency}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-700">
                          {step.description}
                        </p>
                      </div>

                      <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/70 p-2.5 text-[11px] text-amber-900">
                        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                        <span>
                          <strong>Lưu ý thực tế:</strong> {step.warning}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">
                Chọn một thủ tục bên trái hoặc nhấn <strong>Tất cả</strong> để xem hướng dẫn chi tiết.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
