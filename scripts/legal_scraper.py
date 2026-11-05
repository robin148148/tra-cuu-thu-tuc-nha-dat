#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vietnamese Legal & Land Law News Automated Scraper
Fetches RSS feeds and public legal summaries from reputable Vietnamese sources,
filters and categorizes land/property/inheritance/tax articles, and updates
`data/legal_news.json` without duplicates.
"""

from __future__ import annotations

import hashlib
import html
import json
import logging
import re
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any, Dict, List

import feedparser
import requests
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("legal_scraper")

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT_DIR / "data" / "legal_news.json"
PROCEDURES_FILE = ROOT_DIR / "data" / "procedures.json"
PUBLIC_DATA_JS = ROOT_DIR / "public" / "portal-data.js"
ROOT_DATA_JS = ROOT_DIR / "portal-data.js"
MAX_ITEMS = 80
VN_TZ = timezone(timedelta(hours=7))

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/128.0.0.0 Safari/537.36 LegalPortalBot/1.0"
    ),
    "Accept": "application/rss+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
}

# Reputable Vietnamese RSS feeds covering Law, Real Estate, Land & Policy
RSS_SOURCES: List[Dict[str, str]] = [
    {
        "name": "VnExpress Pháp Luật",
        "url": "https://vnexpress.net/rss/phap-luat.rss",
        "default_category": "Chính sách mới",
    },
    {
        "name": "VnExpress Bất Động Sản",
        "url": "https://vnexpress.net/rss/bat-dong-san.rss",
        "default_category": "Đất đai",
    },
    {
        "name": "Báo Dân Trí - Pháp Luật",
        "url": "https://dantri.com.vn/rss/phap-luat.rss",
        "default_category": "Chính sách mới",
    },
    {
        "name": "Báo Dân Trí - Bất Động Sản",
        "url": "https://dantri.com.vn/rss/bat-dong-san.rss",
        "default_category": "Đất đai",
    },
    {
        "name": "Tuổi Trẻ Pháp Luật",
        "url": "https://tuoitre.vn/rss/phap-luat.rss",
        "default_category": "Chính sách mới",
    },
    {
        "name": "Báo Thanh Niên - Thời Sự Pháp Luật",
        "url": "https://thanhnien.vn/rss/thoi-su/phap-luat.rss",
        "default_category": "Chính sách mới",
    },
]

# Keywords to filter relevant Land Law, Red Book, Inheritance, Tax & Dispute news
RELEVANT_KEYWORDS = [
    "đất đai",
    "sổ đỏ",
    "sổ hồng",
    "giấy chứng nhận",
    "thừa kế",
    "di chúc",
    "di sản",
    "tặng cho",
    "chuyển nhượng",
    "sang tên",
    "bất động sản",
    "nhà đất",
    "nhà ở",
    "bảng giá đất",
    "thuế thu nhập cá nhân",
    "lệ phí trước bạ",
    "công chứng",
    "tranh chấp đất",
    "thu hồi đất",
    "bồi thường",
    "tách thửa",
    "hợp thửa",
    "quy hoạch",
    "chung cư",
    "đấu giá đất",
    "luật đất đai",
]

CATEGORY_RULES: List[tuple[str, List[str]]] = [
    ("Thừa kế", ["thừa kế", "di chúc", "di sản", "hàng thừa kế", "khai nhận"]),
    (
        "Thuế - Phí",
        [
            "thuế",
            "lệ phí trước bạ",
            "bảng giá đất",
            "phí công chứng",
            "tiền sử dụng đất",
            "nghĩa vụ tài chính",
        ],
    ),
    (
        "Tranh chấp",
        [
            "tranh chấp",
            "khởi kiện",
            "tòa án",
            "hòa giải",
            "chiếm đất",
            "lấn chiếm",
            "đòi lại đất",
            "bản án",
        ],
    ),
    (
        "Đất đai",
        [
            "sổ đỏ",
            "sổ hồng",
            "cấp đổi",
            "tách thửa",
            "sang tên",
            "chuyển nhượng",
            "tặng cho",
            "quyền sử dụng đất",
            "thu hồi đất",
            "đấu giá đất",
        ],
    ),
]


def clean_html_text(raw_html: str) -> str:
    """Strip HTML tags, decode entities, and normalize whitespace."""
    if not raw_html:
        return ""
    soup = BeautifulSoup(raw_html, "html.parser")
    text = soup.get_text(separator=" ", strip=True)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_date(entry: Any) -> str:
    """Extract and standardize published date to YYYY-MM-DD."""
    raw_date = getattr(entry, "published", None) or getattr(entry, "updated", None)
    if raw_date:
        try:
            dt = parsedate_to_datetime(raw_date)
            return dt.astimezone(VN_TZ).strftime("%Y-%m-%d")
        except Exception:
            pass
    if getattr(entry, "published_parsed", None):
        try:
            t = entry.published_parsed
            return f"{t.tm_year:04d}-{t.tm_mon:02d}-{t.tm_mday:02d}"
        except Exception:
            pass
    return datetime.now(VN_TZ).strftime("%Y-%m-%d")


def classify_category(title: str, summary: str, default_category: str) -> str:
    """Classify article into one of the portal's legal categories."""
    combined = f"{title} {summary}".lower()
    for category, keywords in CATEGORY_RULES:
        if any(kw in combined for kw in keywords):
            return category
    return default_category


def is_land_or_legal_relevant(title: str, summary: str) -> bool:
    """Check whether the article matches Vietnamese land/property/inheritance topics."""
    combined = f"{title} {summary}".lower()
    return any(kw in combined for kw in RELEVANT_KEYWORDS)


def make_item_id(url: str, title: str) -> str:
    """Generate a deterministic short ID from URL or normalized title."""
    basis = (url.strip() or title.strip().lower()).encode("utf-8")
    digest = hashlib.sha256(basis).hexdigest()[:12]
    return f"news-{digest}"


def fetch_rss_items(source: Dict[str, str]) -> List[Dict[str, str]]:
    """Fetch and parse a single RSS feed with requests + feedparser."""
    items: List[Dict[str, str]] = []
    name = source["name"]
    url = source["url"]
    default_cat = source.get("default_category", "Chính sách mới")

    try:
        logger.info("Fetching RSS feed: %s (%s)", name, url)
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        feed = feedparser.parse(response.content)

        for entry in feed.entries[:35]:
            title = clean_html_text(getattr(entry, "title", ""))
            raw_summary = getattr(entry, "summary", "") or getattr(
                entry, "description", ""
            )
            summary = clean_html_text(raw_summary)
            link = getattr(entry, "link", "").strip()

            if not title or not link:
                continue

            if not is_land_or_legal_relevant(title, summary):
                continue

            if len(summary) > 320:
                summary = summary[:317].rstrip() + "..."
            if not summary:
                summary = f"Cập nhật thông tin pháp lý và quy định mới: {title}."

            category = classify_category(title, summary, default_cat)
            pub_date = normalize_date(entry)

            items.append(
                {
                    "id": make_item_id(link, title),
                    "title": title,
                    "summary": summary,
                    "sourceUrl": link,
                    "sourceName": name,
                    "category": category,
                    "publishedDate": pub_date,
                    "scrapedAt": datetime.now(VN_TZ).isoformat(timespec="seconds"),
                }
            )
    except Exception as exc:
        logger.warning("Could not fetch from %s: %s", name, exc)

    return items


def load_existing_news(filepath: Path) -> List[Dict[str, str]]:
    """Load existing JSON array from disk safely."""
    if not filepath.exists():
        return []
    try:
        with filepath.open("r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as exc:
        logger.warning("Failed to read existing %s: %s", filepath, exc)
        return []


def merge_and_deduplicate(
    existing: List[Dict[str, str]], incoming: List[Dict[str, str]]
) -> tuple[List[Dict[str, str]], int]:
    """Merge new non-duplicate articles at the top and sort by publishedDate descending."""
    seen_urls = {
        item.get("sourceUrl", "").strip().rstrip("/")
        for item in existing
        if item.get("sourceUrl")
    }
    seen_titles = {
        re.sub(r"\s+", " ", item.get("title", "").strip().lower())
        for item in existing
        if item.get("title")
    }

    added_count = 0
    new_unique: List[Dict[str, str]] = []

    for item in incoming:
        norm_url = item["sourceUrl"].strip().rstrip("/")
        norm_title = re.sub(r"\s+", " ", item["title"].strip().lower())

        if norm_url in seen_urls or norm_title in seen_titles:
            continue

        seen_urls.add(norm_url)
        seen_titles.add(norm_title)
        new_unique.append(item)
        added_count += 1

    combined = new_unique + existing
    combined.sort(
        key=lambda x: (x.get("publishedDate", ""), x.get("scrapedAt", "")),
        reverse=True,
    )
    return combined[:MAX_ITEMS], added_count


def main() -> int:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    existing = load_existing_news(DATA_FILE)
    logger.info("Loaded %d existing legal news items.", len(existing))

    scraped_items: List[Dict[str, str]] = []
    for source in RSS_SOURCES:
        scraped_items.extend(fetch_rss_items(source))

    logger.info(
        "Scraped %d candidate land/legal news items across %d feeds.",
        len(scraped_items),
        len(RSS_SOURCES),
    )

    merged, added_count = merge_and_deduplicate(existing, scraped_items)

    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
        f.write("\n")

    # Sync standalone preview data bundle
    try:
        procedures_data = load_existing_news(PROCEDURES_FILE)
        js_payload = (
            "window.__PROCEDURES_DATA__ = "
            + json.dumps(procedures_data, ensure_ascii=False)
            + ";\nwindow.__LEGAL_NEWS_DATA__ = "
            + json.dumps(merged, ensure_ascii=False)
            + ";\n"
        )
        PUBLIC_DATA_JS.parent.mkdir(parents=True, exist_ok=True)
        PUBLIC_DATA_JS.write_text(js_payload, encoding="utf-8")
        ROOT_DATA_JS.write_text(js_payload, encoding="utf-8")
        preview_src = ROOT_DIR / "public" / "preview.html"
        if preview_src.exists():
            html_content = preview_src.read_text(encoding="utf-8")
            (ROOT_DIR / "preview.html").write_text(html_content, encoding="utf-8")
            (ROOT_DIR / "index.html").write_text(html_content, encoding="utf-8")
    except Exception as exc:
        logger.warning("Could not sync standalone preview bundle: %s", exc)

    logger.info(
        "Saved %d total items (%d newly added) to %s",
        len(merged),
        added_count,
        DATA_FILE,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
