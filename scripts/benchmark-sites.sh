#!/bin/bash
# Performance benchmark for all sites
# Run before and after migration to compare
# Usage: bash scripts/benchmark-sites.sh [label]

LABEL="${1:-$(date +%Y%m%d-%H%M%S)}"
OUTFILE="benchmarks/perf-${LABEL}.csv"

mkdir -p benchmarks

echo "site,ttfb_ms,html_compressed_kb,html_raw_kb,http_status,timestamp" > "$OUTFILE"

SITES=(
  blog.duyet.net
  cv.duyet.net
  duyet.net
  homelab.duyet.net
  llm-timeline.duyet.net
  photos.duyet.net
  insights.duyet.net
  agents.duyet.net
  ai-percentage.duyet.net
)

echo "Benchmarking ${#SITES[@]} sites..."
echo ""
printf "%-30s %8s %12s %10s %6s\n" "Site" "TTFB" "HTML(gzip)" "HTML(raw)" "Status"
printf "%-30s %8s %12s %10s %6s\n" "----" "----" "----------" "---------" "------"

for site in "${SITES[@]}"; do
  # 3 runs, take median TTFB
  ttfbs=()
  for i in 1 2 3; do
    t=$(curl -o /dev/null -s --compressed -w '%{time_starttransfer}' "https://$site/")
    ttfbs+=("$t")
  done
  # Sort and take middle value
  sorted=($(printf '%s\n' "${ttfbs[@]}" | sort -n))
  ttfb="${sorted[1]}"
  ttfb_ms=$(printf "%.0f" "$(echo "$ttfb * 1000" | bc)")

  # Compressed size (what users download)
  compressed=$(curl -s --compressed -o /dev/null -w '%{size_download}' "https://$site/")
  compressed_kb=$((compressed / 1024))

  # Raw size (uncompressed HTML)
  raw=$(curl -s -o /dev/null -w '%{size_download}' "https://$site/")
  raw_kb=$((raw / 1024))

  # HTTP status
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://$site/")

  printf "%-30s %6sms %10sKB %8sKB %6s\n" "$site" "$ttfb_ms" "$compressed_kb" "$raw_kb" "$code"
  echo "$site,$ttfb_ms,$compressed_kb,$raw_kb,$code,$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$OUTFILE"
done

echo ""
echo "Results saved to $OUTFILE"
