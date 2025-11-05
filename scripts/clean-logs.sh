#!/bin/bash

# Clean Logs Script
# Removes log files from the logs directory

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
LOGS_DIR="logs"
DRY_RUN=false
KEEP_DAYS=0

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --keep-days)
      KEEP_DAYS="$2"
      shift 2
      ;;
    --help)
      echo "Usage: ./scripts/clean-logs.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --dry-run        Show what would be deleted without actually deleting"
      echo "  --keep-days N    Keep logs from last N days (default: 0, deletes all)"
      echo "  --help           Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./scripts/clean-logs.sh                    # Delete all logs"
      echo "  ./scripts/clean-logs.sh --dry-run          # Preview what would be deleted"
      echo "  ./scripts/clean-logs.sh --keep-days 7      # Keep logs from last 7 days"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Check if logs directory exists
if [ ! -d "$LOGS_DIR" ]; then
  echo -e "${YELLOW}No logs directory found. Nothing to clean.${NC}"
  exit 0
fi

# Count files before deletion
TOTAL_FILES=$(find "$LOGS_DIR" -type f | wc -l | tr -d ' ')

if [ "$TOTAL_FILES" -eq 0 ]; then
  echo -e "${YELLOW}No log files found. Nothing to clean.${NC}"
  exit 0
fi

# Build find command based on keep_days
if [ "$KEEP_DAYS" -eq 0 ]; then
  FIND_CMD="find $LOGS_DIR -type f"
  MSG="all log files"
else
  FIND_CMD="find $LOGS_DIR -type f -mtime +$KEEP_DAYS"
  MSG="log files older than $KEEP_DAYS days"
fi

# Get list of files to delete
FILES_TO_DELETE=$($FIND_CMD)
FILES_COUNT=$(echo "$FILES_TO_DELETE" | grep -c . || echo "0")

if [ "$FILES_COUNT" -eq 0 ]; then
  echo -e "${GREEN}No log files to delete.${NC}"
  exit 0
fi

# Show what will be deleted
echo -e "${YELLOW}Found $FILES_COUNT $MSG:${NC}"
echo "$FILES_TO_DELETE"
echo ""

# Calculate total size
TOTAL_SIZE=$(du -sh "$LOGS_DIR" 2>/dev/null | cut -f1)
echo -e "${YELLOW}Total logs directory size: $TOTAL_SIZE${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${GREEN}[DRY RUN] Would delete $FILES_COUNT files${NC}"
  exit 0
fi

# Confirm deletion (only if not dry run and deleting more than 10 files)
if [ "$FILES_COUNT" -gt 10 ]; then
  read -p "Delete $FILES_COUNT files? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cancelled.${NC}"
    exit 0
  fi
fi

# Delete files
echo -e "${GREEN}Deleting $MSG...${NC}"
if [ "$KEEP_DAYS" -eq 0 ]; then
  rm -rf "$LOGS_DIR"/*
else
  find "$LOGS_DIR" -type f -mtime +"$KEEP_DAYS" -delete
fi

echo -e "${GREEN}Successfully cleaned $FILES_COUNT log files!${NC}"
