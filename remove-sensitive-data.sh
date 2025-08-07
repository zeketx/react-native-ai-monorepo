#!/bin/bash

# Script to remove sensitive data from git history
# WARNING: This will rewrite git history!

echo "This script will remove sensitive data from git history."
echo "Make sure you have:"
echo "1. Changed your Supabase password"
echo "2. Backed up your repository"
echo "3. Notified any collaborators"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Remove the file containing sensitive data from all commits
    git filter-branch --force --index-filter \
        "git rm --cached --ignore-unmatch .ai/done/CS-CMS-002-supabase-connection-dns-issue.md" \
        --prune-empty --tag-name-filter cat -- --all
    
    # Add the cleaned version back
    git add .ai/done/CS-CMS-002-supabase-connection-dns-issue.md
    git commit -m "docs: update task documentation"
    
    echo ""
    echo "History cleaned locally. To update remote repository:"
    echo "git push origin --force --all"
    echo "git push origin --force --tags"
    echo ""
    echo "IMPORTANT: All collaborators will need to re-clone the repository!"
fi