#!/bin/bash

# ClientSync Travel Platform - Complete Start Script
# This script starts all services: CMS, Web Dashboard, and Mobile App

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Track PIDs for cleanup
PIDS=()

# Cleanup function
cleanup() {
    print_header "Shutting Down Services"

    if [ ${#PIDS[@]} -gt 0 ]; then
        print_info "Stopping all services..."
        for pid in "${PIDS[@]}"; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done

        # Wait a moment for graceful shutdown
        sleep 2

        # Force kill if still running
        for pid in "${PIDS[@]}"; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        done

        print_success "All services stopped"
    fi

    exit 0
}

# Register cleanup on exit
trap cleanup EXIT INT TERM

# Check if we're in the root directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_header "ClientSync Travel Platform Startup"

# Check prerequisites
print_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js >= 20.0.0"
    exit 1
fi
NODE_VERSION=$(node --version | sed 's/v//')
print_success "Node.js $NODE_VERSION"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm >= 8.0.0"
    print_info "Install with: npm install -g pnpm"
    exit 1
fi
PNPM_VERSION=$(pnpm --version)
print_success "pnpm $PNPM_VERSION"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not installed"
    print_info "Running pnpm install..."
    pnpm install
    print_success "Dependencies installed"
else
    print_success "Dependencies installed"
fi

# Check for environment files
print_info "Checking environment configuration..."

if [ ! -f "packages/cms/.env" ]; then
    print_warning "CMS .env file not found (packages/cms/.env)"
    print_info "Using default configuration or .env.example"
fi

if [ ! -f "packages/mobile-app/.env" ]; then
    print_warning "Mobile app .env file not found (packages/mobile-app/.env)"
    print_info "Using default configuration or .env.example"
fi

# Create logs directory
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

print_header "Starting Services"

# Start CMS Backend
print_info "Starting Payload CMS Backend..."
pnpm --filter cms dev > "$LOG_DIR/cms_$TIMESTAMP.log" 2>&1 &
CMS_PID=$!
PIDS+=($CMS_PID)
print_success "CMS started (PID: $CMS_PID)"
print_info "  → API: http://localhost:3001/api"
print_info "  → Admin UI: http://localhost:3001/admin"
print_info "  → Logs: $LOG_DIR/cms_$TIMESTAMP.log"

# Wait a moment for CMS to start
sleep 3

# Start Web Dashboard
print_info "Starting Web Dashboard..."
pnpm --filter web-dashboard dev > "$LOG_DIR/dashboard_$TIMESTAMP.log" 2>&1 &
DASHBOARD_PID=$!
PIDS+=($DASHBOARD_PID)
print_success "Web Dashboard started (PID: $DASHBOARD_PID)"
print_info "  → Dashboard: http://localhost:5173"
print_info "  → Logs: $LOG_DIR/dashboard_$TIMESTAMP.log"

# Wait a moment for dashboard to start
sleep 2

# Start Mobile App
print_info "Starting React Native Mobile App..."
pnpm --filter mobile-app dev > "$LOG_DIR/mobile_$TIMESTAMP.log" 2>&1 &
MOBILE_PID=$!
PIDS+=($MOBILE_PID)
print_success "Mobile App started (PID: $MOBILE_PID)"
print_info "  → Expo DevTools: Check terminal for QR code"
print_info "  → Logs: $LOG_DIR/mobile_$TIMESTAMP.log"

print_header "All Services Running"

print_success "CMS Backend: http://localhost:3001"
print_success "Web Dashboard: http://localhost:5173"
print_success "Mobile App: Expo DevTools (check logs)"

echo ""
print_info "Service PIDs: ${PIDS[*]}"
print_info "Log files: $LOG_DIR/"
echo ""
print_warning "Press Ctrl+C to stop all services"
echo ""

# Monitor services
while true; do
    # Check if any service has died
    for pid in "${PIDS[@]}"; do
        if ! kill -0 "$pid" 2>/dev/null; then
            print_error "Service with PID $pid has stopped unexpectedly"
            print_info "Check logs in $LOG_DIR/ for details"
            exit 1
        fi
    done

    sleep 5
done
