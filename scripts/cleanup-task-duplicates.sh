#!/bin/bash

# Script to clean up duplicate task files in .ai folder

echo "Cleaning up duplicate task files..."

# Navigate to the .ai directory
cd /Users/ezekielmauricio/Documents/dev/github/public/rne/my-rn-app/.ai

# Remove CS-PC-003 from backlog (it's already in done)
if [ -f "backlog/CS-PC-003-implement-authentication.md" ]; then
    rm "backlog/CS-PC-003-implement-authentication.md"
    echo "✓ Removed CS-PC-003 from backlog"
fi

# Remove CS-PC-003 from doing (it's already in done)
if [ -f "doing/CS-PC-003-implement-authentication.md" ]; then
    rm "doing/CS-PC-003-implement-authentication.md"
    echo "✓ Removed CS-PC-003 from doing"
fi

echo "Cleanup complete!"
echo ""
echo "Current status:"
echo "- Backlog tasks:"
ls backlog/ | grep -E "CS-PC-[0-9]+" || echo "  No CS-PC tasks in backlog"
echo ""
echo "- Doing tasks:"
ls doing/ | grep -E "CS-PC-[0-9]+" || echo "  No CS-PC tasks in doing"
echo ""
echo "- Done tasks:"
ls done/ | grep -E "CS-PC-[0-9]+" || echo "  No CS-PC tasks in done"