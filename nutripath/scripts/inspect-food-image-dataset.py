#!/usr/bin/env python3
"""
scripts/inspect-food-image-dataset.py

MM-Food-100K Dataset Inspector for SMANU SmartNutrition
========================================================
Purpose: Evaluate whether the MM-Food-100K dataset is suitable
         for assessing food recognition quality on Indonesian foods —
         WITHOUT downloading all images upfront.

Usage:
    # Inspect from remote URL (downloads CSV only, ~few MB):
    python scripts/inspect-food-image-dataset.py

    # Inspect a locally downloaded CSV:
    python scripts/inspect-food-image-dataset.py --file MM-Food-100K.csv

    # Show more sample rows:
    python scripts/inspect-food-image-dataset.py --samples 10

Requirements:
    pip install pandas requests

What this script does:
    1. Loads the CSV (remote or local).
    2. Reports columns, dtypes, and shape.
    3. Shows sample records.
    4. Reports label distribution (top-N food classes).
    5. Reports missing value counts per column.
    6. Checks for image URL patterns and accessibility of a small sample.
    7. Checks for nutrient/annotation columns.
    8. Identifies Indonesian food labels (keyword match).
    9. Outputs a plain-text evaluation summary.

What this script does NOT do:
    - Fine-tune any model.
    - Download all images.
    - Import nutrient values as production data.
    - Treat dataset annotations as ground truth for nutrition.
"""

import argparse
import sys
import os
from typing import Optional

# ---------------------------------------------------------------------------
# Dependency check
# ---------------------------------------------------------------------------
MISSING = []
try:
    import pandas as pd
except ImportError:
    MISSING.append("pandas")
try:
    import requests
except ImportError:
    MISSING.append("requests")

if MISSING:
    print(f"❌ Missing Python packages: {', '.join(MISSING)}")
    print(f"   Install with: pip install {' '.join(MISSING)}")
    sys.exit(1)

import pandas as pd
import requests

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CSV_URL = (
    "https://huggingface.co/datasets/"
    "Humanbased-AI/MM-Food-100K/resolve/main/MM-Food-100K.csv"
)

# Keywords for Indonesian food detection (case-insensitive substring match)
INDONESIAN_KEYWORDS = [
    "nasi", "goreng", "tempe", "tahu", "ayam", "rendang", "soto",
    "gado", "bakso", "mie", "mi ", "opor", "ketupat", "lontong",
    "sate", "satay", "martabak", "bubur", "kangkung", "sayur",
    "ikan", "udang", "sambal", "kerupuk", "pecel", "siomay",
    "batagor", "pempek", "gudeg", "rawon", "semur", "capcay",
    "balado", "dendeng", "kari", "curry", "tofu", "tempeh",
    "rice", "coconut", "indonesian", "javanese", "balinese",
    "padang", "sundanese",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_csv(path_or_url: str, is_url: bool) -> pd.DataFrame:
    """Load CSV from local file or URL."""
    if is_url:
        print(f"📥 Downloading CSV from HuggingFace...")
        print(f"   URL: {path_or_url}")
        try:
            resp = requests.get(path_or_url, timeout=60)
            resp.raise_for_status()
            from io import StringIO
            df = pd.read_csv(StringIO(resp.text))
            print(f"   ✅ Downloaded: {len(resp.content) / 1024:.1f} KB")
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Download failed: {e}")
            print(
                "   → Save MM-Food-100K.csv locally and use: "
                "--file MM-Food-100K.csv"
            )
            sys.exit(1)
    else:
        print(f"📂 Loading local CSV: {path_or_url}")
        if not os.path.exists(path_or_url):
            print(f"   ❌ File not found: {path_or_url}")
            sys.exit(1)
        df = pd.read_csv(path_or_url)
        print(f"   ✅ Loaded: {os.path.getsize(path_or_url)/1024:.1f} KB")
    return df


def check_url_sample(df: pd.DataFrame, url_col: str, n: int = 5) -> None:
    """Check if a small sample of image URLs respond (HEAD requests only)."""
    print(f"\n🌐 Checking {n} image URLs from column '{url_col}'...")
    sample_urls = df[url_col].dropna().head(n).tolist()
    for url in sample_urls:
        try:
            r = requests.head(str(url), timeout=8, allow_redirects=True)
            status = r.status_code
            ctype = r.headers.get("Content-Type", "?")
            size = r.headers.get("Content-Length", "?")
            ok = "✅" if status == 200 else "⚠️ "
            print(f"   {ok} [{status}] {str(url)[:80]}  ({ctype}, {size} B)")
        except Exception as e:
            print(f"   ❌ {str(url)[:60]} — {e}")


def find_url_columns(df: pd.DataFrame) -> list:
    """Detect columns that likely contain image URLs."""
    url_cols = []
    for col in df.columns:
        sample = df[col].dropna().head(10).astype(str)
        if sample.str.startswith(("http://", "https://")).any():
            url_cols.append(col)
    return url_cols


def find_indonesian_rows(df: pd.DataFrame, label_col: Optional[str]) -> int:
    """Count rows with Indonesian food labels."""
    if label_col is None:
        return 0
    labels = df[label_col].dropna().astype(str).str.lower()
    mask = labels.apply(
        lambda x: any(kw in x for kw in INDONESIAN_KEYWORDS)
    )
    return int(mask.sum())


# ---------------------------------------------------------------------------
# Main inspection
# ---------------------------------------------------------------------------

def inspect(df: pd.DataFrame, n_samples: int, check_urls: bool) -> None:
    sep = "═" * 65

    print(f"\n{sep}")
    print(" MM-Food-100K Dataset Inspection Report")
    print(f"{sep}")

    # 1. Shape
    print(f"\n📐 Shape: {df.shape[0]:,} rows × {df.shape[1]} columns")

    # 2. Columns & dtypes
    print("\n📋 Columns and data types:")
    for col, dtype in df.dtypes.items():
        n_null = df[col].isna().sum()
        pct_null = n_null / len(df) * 100
        print(f"   {col:<35} {str(dtype):<12}  missing: {n_null:>6} ({pct_null:.1f}%)")

    # 3. Samples
    print(f"\n🔍 Sample records ({n_samples} rows):")
    print(df.head(n_samples).to_string(max_colwidth=60))

    # 4. Label distribution
    # Try to detect label column
    label_candidates = [
        c for c in df.columns
        if any(kw in c.lower() for kw in ["label", "class", "category", "food", "name", "title"])
    ]
    label_col: Optional[str] = label_candidates[0] if label_candidates else None

    if label_col:
        print(f"\n📊 Label distribution (column: '{label_col}', top 30):")
        vc = df[label_col].value_counts()
        print(f"   Unique labels: {vc.shape[0]:,}")
        print(vc.head(30).to_string())

        indo_count = find_indonesian_rows(df, label_col)
        pct_indo = indo_count / len(df) * 100
        print(f"\n🇮🇩 Rows with Indonesian food keywords: {indo_count:,} ({pct_indo:.1f}%)")
    else:
        print("\n⚠️  No obvious label column found. Columns available:")
        print("   " + ", ".join(df.columns.tolist()))

    # 5. Nutrient / annotation columns
    nutrient_keywords = [
        "calorie", "kcal", "protein", "fat", "carb", "fiber",
        "sodium", "sugar", "energy", "macro", "nutrition", "nutrient",
    ]
    nutrient_cols = [
        c for c in df.columns
        if any(kw in c.lower() for kw in nutrient_keywords)
    ]
    if nutrient_cols:
        print(f"\n🧪 Nutrition-related columns found: {nutrient_cols}")
        print("   ⚠️  Do NOT use these as production nutrition data without")
        print("       verification against TKPI-2017 or USDA FoodData Central.")
        print(df[nutrient_cols].describe().to_string())
    else:
        print("\n🧪 No nutrition/macro columns detected.")

    # 6. Image URL columns
    url_cols = find_url_columns(df)
    if url_cols:
        print(f"\n🖼️  Image URL column(s) found: {url_cols}")
        if check_urls and url_cols:
            check_url_sample(df, url_cols[0])
    else:
        print("\n🖼️  No image URL columns detected.")
        print("   Available columns:", df.columns.tolist())

    # 7. Missing value summary
    print("\n📉 Missing value overview:")
    mv = df.isna().sum()
    mv = mv[mv > 0].sort_values(ascending=False)
    if mv.empty:
        print("   No missing values found.")
    else:
        print(mv.to_string())

    # 8. Evaluation summary
    print(f"\n{sep}")
    print(" SMANU Evaluation Summary")
    print(f"{sep}")
    print(f"""
Dataset     : MM-Food-100K (Humanbased-AI / HuggingFace)
License     : OpenRAIL-M — review usage restrictions before commercial use.
              Non-commercial educational use should be acceptable; confirm at:
              https://huggingface.co/datasets/Humanbased-AI/MM-Food-100K

Records     : {df.shape[0]:,}
Columns     : {df.shape[1]}
Label col   : {label_col or "Not detected"}
Unique foods: {df[label_col].nunique() if label_col else "N/A"}
Indo foods  : {find_indonesian_rows(df, label_col):,} rows ({find_indonesian_rows(df, label_col)/len(df)*100:.1f}%)

Recommendations:
  1. Use this dataset for EVALUATING the existing Gemini vision model —
     not for fine-tuning until evaluation baseline is established.
  2. Indonesian food coverage appears to be {"low — supplement with TKPI-aligned labeled photos." if label_col and find_indonesian_rows(df, label_col)/len(df) < 0.05 else "present — review label quality before use."}
  3. Nutrition annotations (if any) are NOT a substitute for TKPI/USDA data.
  4. Download only the images you need for evaluation; do not bulk-download.
  5. Store evaluation results in data/food-scanner/ (gitignored).
""")

    print(f"{sep}")
    print(" Inspection complete. No images downloaded. No model trained.")
    print(f"{sep}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="MM-Food-100K Dataset Inspector for SMANU"
    )
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="Path to local MM-Food-100K.csv file. If not given, downloads from HuggingFace.",
    )
    parser.add_argument(
        "--samples",
        type=int,
        default=5,
        help="Number of sample rows to display (default: 5)",
    )
    parser.add_argument(
        "--check-urls",
        action="store_true",
        default=False,
        help="Send HEAD requests to a few image URLs to test accessibility.",
    )
    args = parser.parse_args()

    is_url = args.file is None
    source = CSV_URL if is_url else args.file

    df = load_csv(source, is_url)
    inspect(df, n_samples=args.samples, check_urls=args.check_urls)


if __name__ == "__main__":
    main()
