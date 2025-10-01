#!/bin/bash

for i in {1..12}; do
    echo "=== Check $i at $(date +%H:%M:%S) ==="

    gh run list --branch redesign/anthropic-beige-palette --limit 3 | grep -E "(ESLint|Test)" | head -2

    workflows_status=$(gh run list --branch redesign/anthropic-beige-palette --json status,name --limit 3)

    if echo "$workflows_status" | grep -q '"status":"completed"'; then
        echo "✓ Workflows have completed!"
        break
    fi

    if [ $i -lt 12 ]; then
        echo "Waiting 30 seconds..."
        sleep 30
    fi
done

echo ""
echo "Final status:"
gh pr checks 683
