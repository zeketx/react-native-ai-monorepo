#!/bin/bash

# Script to clean up all duplicate task files in .ai folder

echo "=== Task Duplicate Cleanup Script ==="
echo ""

# Navigate to the .ai directory
cd /Users/ezekielmauricio/Documents/dev/github/public/rne/my-rn-app/.ai

# CS-P0-016: Keep only in backlog (it's NOT completed)
echo "1. Cleaning CS-P0-016..."
if [ -f "done/CS-P0-016.md" ]; then
    rm "done/CS-P0-016.md"
    echo "   ✓ Removed CS-P0-016.md from done (was not actually completed)"
fi
if [ -f "backlog/CS-P0-016-create-env-files.md" ]; then
    rm "backlog/CS-P0-016-create-env-files.md"
    echo "   ✓ Removed duplicate CS-P0-016-create-env-files.md from backlog"
fi
echo "   → CS-P0-016 should only be in backlog/ (not completed yet)"

# CS-P0-017: Keep only in done
echo ""
echo "2. Cleaning CS-P0-017..."
if [ -f "backlog/CS-P0-017.md" ]; then
    rm "backlog/CS-P0-017.md"
    echo "   ✓ Removed CS-P0-017.md from backlog"
fi
echo "   → CS-P0-017 should only be in done/"

# CS-PC-003: Keep only in done
echo ""
echo "3. Cleaning CS-PC-003..."
if [ -f "backlog/CS-PC-003-implement-authentication.md" ]; then
    rm "backlog/CS-PC-003-implement-authentication.md"
    echo "   ✓ Removed CS-PC-003 from backlog"
fi
if [ -f "doing/CS-PC-003-implement-authentication.md" ]; then
    rm "doing/CS-PC-003-implement-authentication.md"
    echo "   ✓ Removed CS-PC-003 from doing"
fi
echo "   → CS-PC-003 should only be in done/"

# CS-PC-004: Keep only in doing (it's in progress)
echo ""
echo "4. Cleaning CS-PC-004..."
if [ -f "backlog/CS-PC-004-migrate-api-endpoints.md" ]; then
    rm "backlog/CS-PC-004-migrate-api-endpoints.md"
    echo "   ✓ Removed CS-PC-004 from backlog"
fi
echo "   → CS-PC-004 should only be in doing/ (currently in progress)"

echo ""
echo "=== Cleanup Complete! ==="
echo ""
echo "Current task distribution:"
echo ""
echo "BACKLOG tasks:"
ls backlog/*.md 2>/dev/null | xargs -I {} basename {} | sort || echo "  (empty)"
echo ""
echo "DOING tasks:"
ls doing/*.md 2>/dev/null | xargs -I {} basename {} | sort || echo "  (empty)"
echo ""
echo "DONE tasks:"
ls done/*.md 2>/dev/null | xargs -I {} basename {} | sort | head -10
echo "  ... and $(ls done/*.md 2>/dev/null | wc -l) total completed tasks"