#!/bin/bash

ESLINT_RUN_ID=18152668407
TEST_RUN_ID=18152668417

for i in {1..20}; do
    echo "=== Check $i at $(date +%H:%M:%S) ==="

    # Get status using JSON output
    eslint_status=$(gh run view $ESLINT_RUN_ID --json status --jq .status)
    test_status=$(gh run view $TEST_RUN_ID --json status --jq .status)

    echo "ESLint: $eslint_status"
    echo "Test: $test_status"

    if [ "$eslint_status" = "completed" ] && [ "$test_status" = "completed" ]; then
        echo ""
        echo "✓ Both workflows completed!"
        break
    fi

    if [ $i -lt 20 ]; then
        echo "Waiting 20 seconds..."
        sleep 20
    fi
done

echo ""
echo "=== Final Results ==="
echo ""
echo "ESLint workflow:"
gh run view $ESLINT_RUN_ID

echo ""
echo "Test workflow:"
gh run view $TEST_RUN_ID

echo ""
echo "PR checks status:"
gh pr checks 683
