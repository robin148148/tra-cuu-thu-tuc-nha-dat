"use client";

import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  Calculator,
  Coins,
  FileSpreadsheet,
  HeartHandshake,
  Home,
  Info,
  Receipt,
} from "lucide-react";

type TransactionType = "transfer" | "gift" | "inheritance";

/**
 * Progressive Notarization Fee Schedule according to Circular 257/2016/TT-BTC
 */
function calculateNotaryFee(valueVnd: number): number {
  if (valueVnd <= 0) return 0;
  const million = 1_000_000;
  const billion = 1_000_000_000;

  let fee = 0;
  if (valueVnd < 50 * million) {
    fee = 50_000;
  } else if (valueVnd <= 100 * million) {
    fee = 100_000;
  } else if (valueVnd <= 1 * billion) {
    fee = valueVnd * 0.001; // 0.1%
  } else if (valueVnd <= 3 * billion) {
    fee = 1 * million + (valueVnd - 1 * billion) * 0.0006; // 1M + 0.06%
  } else if (valueVnd <= 5 * billion) {
    fee = 2.2 * million + (valueVnd - 3 * billion) * 0.0005; // 2.2M + 0.05%
  } else if (valueVnd <= 10 * billion) {
    fee = 3.2 * million + (valueVnd - 5 * billion) * 0.0004; // 3.2M + 0.04%
  } else if (valueVnd <= 100 * billion) {
    fee = 5.2 * million + (valueVnd - 10 * billion) * 0.0003; // 5.2M + 0.03%
  } else {
    fee = 32.2 * million + (valueVnd - 100 * billion) * 0.0002; // 32.2M + 0.02%
  }

  return Math.min(Math.round(fee), 70_000_000); // Cap at 70,000,000 VND
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " đ";
}

const PRESET_VALUES = [
  { label: "500 Triệu", value: 500_000_000 },
  { label: "1.5 Tỷ", value: 1_500_000_000 },
  { label: "3 Tỷ", value: 3_000_000_000 },
  { label: "5 Tỷ", value: 5_000_000_000 },
  { label: "10 Tỷ", value: 10_000_000_000 },
];

export default function FeeCalculator() {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("transfer");
  const [propertyValue, setPropertyValue] = useState<number>(2_500_000_000);
  const [isImmediateFamily, setIsImmediateFamily] = useState<boolean>(false);
  const [isSoleProperty, setIsSoleProperty] = useState<boolean>(false);
  const [isUrbanArea, setIsUrbanArea] = useState<boolean>(true);

  const breakdown = useMemo(() => {
    const val = Math.max(0, propertyValue);

    // 1. Personal Income Tax (Thuế TNCN)
    let pitAmount = 0;
    let pitNote = "";

    if (isImmediateFamily) {
      pitAmount = 0;
      pitNote =
        "Miễn 100% Thuế TNCN do giao dịch giữa người thân trực hệ / vợ chồng / anh chị em ruột (Khoản 1 & 4 Điều 4 Luật Thuế TNCN).";
    } else if (transactionType === "transfer" && isSoleProperty) {
      pitAmount = 0;
      pitNote =
        "Miễn 100% Thuế TNCN do chuyển nhượng nhà ở, quyền sử dụng đất ở duy nhất tại Việt Nam (Khoản 2 Điều 4 Luật Thuế TNCN).";
    } else if (transactionType === "transfer") {
      pitAmount = val * 0.02;
      pitNote = "2% trên giá trị chuyển nhượng (Điều 17 Thông tư 92/2015/TT-BTC).";
    } else {
      // Gift or inheritance outside immediate family: 10% on amount exceeding 10,000,000 VND
      pitAmount = Math.max(0, val - 10_000_000) * 0.1;
      pitNote =
        "10% trên phần giá trị vượt 10 triệu đồng đối với tặng cho/thừa kế ngoài quan hệ nhân thân trực hệ.";
    }

    // 2. Registration Fee (Lệ phí trước bạ - 0.5%)
    let registrationFee = 0;
    let regNote = "";
    if (
      isImmediateFamily &&
      (transactionType === "gift" || transactionType === "inheritance")
    ) {
      registrationFee = 0;
      regNote =
        "Miễn 100% Lệ phí trước bạ khi nhận thừa kế/tặng cho giữa người thân trực hệ (Khoản 10 Điều 10 Nghị định 10/2022/NĐ-CP).";
    } else {
      registrationFee = Math.min(val * 0.005, 500_000_000);
      regNote =
        "0.5% giá trị nhà đất (Trần tối đa 500 triệu đồng/tài sản theo Nghị định 10/2022/NĐ-CP).";
    }

    // 3. Notarization Fee (Phí công chứng - Thông tư 257/2016/TT-BTC)
    const notaryFee = calculateNotaryFee(val);

    // 4. Dossier Appraisal & Certificate Issuance Fee (Phí thẩm định hồ sơ & Lệ phí cấp GCN)
    const rawAppraisal = val * 0.0015;
    const appraisalCap = isUrbanArea ? 5_000_000 : 2_500_000;
    const appraisalFloor = isUrbanArea ? 500_000 : 300_000;
    const appraisalFee =
      val > 0
        ? Math.min(Math.max(rawAppraisal, appraisalFloor), appraisalCap)
        : 0;
    const certIssuanceFee = isUrbanArea ? 100_000 : 50_000;

    const total =
      pitAmount +
      registrationFee +
      notaryFee +
      appraisalFee +
      certIssuanceFee;

    return {
      pitAmount,
      pitNote,
      registrationFee,
      regNote,
      notaryFee,
      appraisalFee,
      certIssuanceFee,
      total,
    };
  }, [
    transactionType,
    propertyValue,
    isImmediateFamily,
    isSoleProperty,
    isUrbanArea,
  ]);

  return (
    <section id="tinh-thue-phi" className="scroll-mt-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
              <Calculator className="h-3.5 w-3.5" />
              Công cụ tính toán tự động theo Biểu phí Bộ Tài chính
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Bảng Tính Thuế TNCN, Lệ Phí Trước Bạ & Phí Công Chứng
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ước tính chính xác nghĩa vụ tài chính khi Chuyển nhượng, Tặng cho, Thừa kế Sổ đỏ kèm xét điều kiện miễn thuế nhân thân trực hệ.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Inputs */}
          <div className="space-y-5 lg:col-span-7">
            {/* Transaction Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                1. Loại hình giao dịch nhà đất
              </label>
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  {
                    id: "transfer",
                    label: "Chuyển nhượng / Mua bán",
                    desc: "Thuế TNCN 2% + Trước bạ 0.5%",
                  },
                  {
                    id: "gift",
                    label: "Tặng cho BĐS",
                    desc: "Miễn thuế cho người thân trực hệ",
                  },
                  {
                    id: "inheritance",
                    label: "Nhận Thừa kế BĐS",
                    desc: "Theo di chúc hoặc theo pháp luật",
                  },
                ].map((tab) => {
                  const active = transactionType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setTransactionType(tab.id as TransactionType)
                      }
                      className={`rounded-xl border p-3.5 text-left transition-all ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-sm font-bold">{tab.label}</div>
                      <div
                        className={`mt-1 text-[11px] ${
                          active ? "text-amber-300" : "text-slate-500"
                        }`}
                      >
                        {tab.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Property Value Input */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="property-value-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  2. Giá trị nhà đất theo Hợp đồng / Bảng giá đất (VNĐ)
                </label>
                <span className="text-xs font-bold text-amber-700">
                  {formatVnd(propertyValue)}
                </span>
              </div>

              <div className="relative mt-2">
                <Coins className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="property-value-input"
                  type="number"
                  min={0}
                  step={50_000_000}
                  value={propertyValue}
                  onChange={(e) =>
                    setPropertyValue(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-base font-bold text-slate-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Quick Presets */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Chọn nhanh:</span>
                {PRESET_VALUES.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setPropertyValue(preset.value)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                      propertyValue === preset.value
                        ? "border-amber-600 bg-amber-50 text-amber-800"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Statutory Exemption Checkboxes */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                3. Điều kiện miễn thuế & Khu vực hành chính
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-amber-400">
                <input
                  type="checkbox"
                  checked={isImmediateFamily}
                  onChange={(e) => setIsImmediateFamily(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <div className="text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900">
                    <HeartHandshake className="h-4 w-4 text-emerald-600" />
                    Quan hệ nhân thân trực hệ trong gia đình (Miễn thuế)
                  </span>
                  <p className="mt-0.5 text-slate-600">
                    Áp dụng giữa: Vợ - chồng; Cha mẹ đẻ/nuôi - Con đẻ/nuôi/dâu/rể; Ông bà nội/ngoại - Cháu ruột; Anh chị em ruột với nhau.
                  </p>
                </div>
              </label>

              {transactionType === "transfer" && (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-amber-400">
                  <input
                    type="checkbox"
                    checked={isSoleProperty}
                    onChange={(e) => setIsSoleProperty(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Home className="h-4 w-4 text-amber-600" />
                      Nhà ở, quyền sử dụng đất ở duy nhất (Giữ tối thiểu 183 ngày)
                    </span>
                    <p className="mt-0.5 text-slate-600">
                      Miễn thuế TNCN 2% cho bên chuyển nhượng theo Khoản 2 Điều 4 Luật Thuế TNCN (vẫn nộp 0.5% lệ phí trước bạ).
                    </p>
                  </div>
                </label>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-700">
                  Khu vực bất động sản:
                </span>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setIsUrbanArea(true)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold ${
                      isUrbanArea
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Phường / Đô thị
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUrbanArea(false)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold ${
                      !isUrbanArea
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Xã / Nông thôn
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Fee Breakdown */}
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col justify-between rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Tổng chi phí sang tên dự kiến
                    </span>
                    <div className="mt-1 text-3xl font-extrabold tracking-tight text-white">
                      {formatVnd(breakdown.total)}
                    </div>
                  </div>
                  <Receipt className="h-9 w-9 text-amber-400" />
                </div>

                {/* Line Items */}
                <div className="mt-5 space-y-4">
                  {/* PIT */}
                  <div className="rounded-xl bg-slate-800/80 p-3.5">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>1. Thuế thu nhập cá nhân (TNCN)</span>
                      <span
                        className={
                          breakdown.pitAmount === 0
                            ? "text-emerald-400"
                            : "text-amber-300"
                        }
                      >
                        {breakdown.pitAmount === 0
                          ? "0 đ (Được miễn)"
                          : formatVnd(breakdown.pitAmount)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                      {breakdown.pitNote}
                    </p>
                  </div>

                  {/* Registration Fee */}
                  <div className="rounded-xl bg-slate-800/80 p-3.5">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>2. Lệ phí trước bạ (0.5%)</span>
                      <span
                        className={
                          breakdown.registrationFee === 0
                            ? "text-emerald-400"
                            : "text-amber-300"
                        }
                      >
                        {breakdown.registrationFee === 0
                          ? "0 đ (Được miễn)"
                          : formatVnd(breakdown.registrationFee)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                      {breakdown.regNote}
                    </p>
                  </div>

                  {/* Notarization Fee */}
                  <div className="rounded-xl bg-slate-800/80 p-3.5">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>3. Phí công chứng hợp đồng</span>
                      <span className="text-white">
                        {formatVnd(breakdown.notaryFee)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-300">
                      Biểu phí lũy tiến theo giá trị tài sản tại Thông tư 257/2016/TT-BTC (Chưa gồm thù lao soạn thảo ~300.000đ).
                    </p>
                  </div>

                  {/* Appraisal & Certificate Fee */}
                  <div className="rounded-xl bg-slate-800/80 p-3.5">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>4. Phí thẩm định & Cấp phôi Sổ mới</span>
                      <span className="text-white">
                        {formatVnd(
                          breakdown.appraisalFee + breakdown.certIssuanceFee
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-300">
                      Gồm phí thẩm định hồ sơ ({formatVnd(breakdown.appraisalFee)}) + Lệ phí cấp đổi Giấy chứng nhận ({formatVnd(breakdown.certIssuanceFee)}).
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  Theo Luật Đất đai 2024, giá tính thuế TNCN và Lệ phí trước bạ căn cứ theo giá ghi trên Hợp đồng công chứng; nếu thấp hơn Bảng giá đất do UBND cấp tỉnh ban hành thì áp dụng theo Bảng giá đất.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
