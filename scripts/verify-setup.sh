#!/bin/bash

# ClientSync Foundation Setup Verification Script
# 
# This script performs comprehensive verification of the monorepo setup,
# shared package functionality, and ensures all foundation components
# are working correctly before proceeding to Phase 1.
#
# Usage: 
#   chmod +x scripts/verify-setup.sh
#   ./scripts/verify-setup.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Error tracking
ERRORS=0
WARNINGS=0

# Helper functions
print_header() {
    echo -e "\n${CYAN}$1${NC}"
    echo "========================================"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main verification function
main() {
    echo -e "${CYAN}🔍 Verifying ClientSync Foundation Setup...${NC}\n"
    
    # 1. Check development environment
    print_header "1. Development Environment"
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js version: $NODE_VERSION"
        
        # Check if Node version is >= 20
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -ge 20 ]; then
            print_success "Node.js version meets requirements (>=20)"
        else
            print_error "Node.js version must be >= 20, found $NODE_VERSION"
        fi
    else
        print_error "Node.js is not installed"
    fi
    
    if command_exists pnpm; then
        PNPM_VERSION=$(pnpm --version)
        print_success "PNPM version: $PNPM_VERSION"
    else
        print_error "PNPM is not installed"
    fi
    
    # 2. Check monorepo structure
    print_header "2. Monorepo Structure"
    
    if [ -f "pnpm-workspace.yaml" ]; then
        print_success "pnpm-workspace.yaml exists"
        print_info "Workspace configuration:"
        cat pnpm-workspace.yaml | grep -E "^packages:" -A 10
    else
        print_error "pnpm-workspace.yaml not found"
    fi
    
    if [ -f "package.json" ]; then
        print_success "Root package.json exists"
        
        # Check if it's configured as a monorepo
        if grep -q '"private": true' package.json; then
            print_success "Root package is private (monorepo setup)"
        else
            print_warning "Root package should be private for monorepo"
        fi
    else
        print_error "Root package.json not found"
    fi
    
    # 3. Check packages
    print_header "3. Package Structure"
    
    if [ -d "packages" ]; then
        print_success "packages/ directory exists"
        
        # List packages
        print_info "Found packages:"
        for package_dir in packages/*/; do
            if [ -d "$package_dir" ]; then
                package_name=$(basename "$package_dir")
                if [ -f "${package_dir}package.json" ]; then
                    print_success "  📦 $package_name (has package.json)"
                else
                    print_warning "  📦 $package_name (missing package.json)"
                fi
            fi
        done
    else
        print_error "packages/ directory not found"
    fi
    
    # 4. Check workspace packages with pnpm
    print_header "4. Workspace Packages"
    
    if command_exists pnpm; then
        print_info "Listing workspace packages:"
        if pnpm ls -r --depth 0 2>/dev/null; then
            print_success "Workspace packages listed successfully"
        else
            print_error "Failed to list workspace packages"
        fi
    fi
    
    # 5. Check shared package
    print_header "5. Shared Package Verification"
    
    if [ -d "packages/shared" ]; then
        print_success "Shared package directory exists"
        
        cd packages/shared || exit 1
        
        if [ -f "package.json" ]; then
            print_success "Shared package.json exists"
            
            # Check package name
            PACKAGE_NAME=$(grep '"name"' package.json | sed 's/.*"name": "\(.*\)".*/\1/')
            print_info "Package name: $PACKAGE_NAME"
        else
            print_error "Shared package.json not found"
        fi
        
        # Try to build shared package
        print_info "Attempting to build shared package..."
        if pnpm build 2>/dev/null; then
            print_success "Shared package builds successfully"
        else
            print_warning "Shared package build failed or no build script"
        fi
        
        cd ../.. || exit 1
    else
        print_error "packages/shared directory not found"
    fi
    
    # 6. Check mobile app package
    print_header "6. Mobile App Package"
    
    if [ -d "packages/mobile-app" ]; then
        print_success "Mobile app directory exists"
        
        if [ -f "packages/mobile-app/package.json" ]; then
            print_success "Mobile app package.json exists"
            
            # Check for React Native/Expo dependencies
            if grep -q '"expo"' packages/mobile-app/package.json; then
                print_success "Expo dependency found"
            else
                print_warning "Expo dependency not found"
            fi
            
            if grep -q '"react-native"' packages/mobile-app/package.json; then
                print_success "React Native dependency found"
            else
                print_warning "React Native dependency not found"
            fi
        else
            print_error "Mobile app package.json not found"
        fi
    else
        print_error "packages/mobile-app directory not found"
    fi
    
    # 7. Check environment configuration
    print_header "7. Environment Configuration"
    
    if [ -f ".env.example" ]; then
        print_success ".env.example file exists"
    else
        print_error ".env.example file not found"
    fi
    
    if [ -f ".env.local" ]; then
        print_success ".env.local file exists"
        
        # Check environment variables using our validation script
        if [ -f "scripts/check-env.js" ]; then
            print_info "Running environment validation..."
            if node scripts/check-env.js 2>/dev/null; then
                print_success "Environment variables validation passed"
            else
                print_warning "Environment variables validation failed or has warnings"
            fi
        else
            print_warning "Environment validation script not found"
        fi
    else
        print_warning ".env.local file not found (copy from .env.example)"
    fi
    
    # 8. Check git configuration
    print_header "8. Git Configuration"
    
    if [ -d ".git" ]; then
        print_success "Git repository initialized"
        
        if [ -f ".gitignore" ]; then
            print_success ".gitignore file exists"
            
            # Check if sensitive files are ignored
            if grep -q ".env.local" .gitignore; then
                print_success "Environment files are properly ignored"
            else
                print_warning "Environment files may not be properly ignored"
            fi
        else
            print_error ".gitignore file not found"
        fi
    else
        print_error "Not a git repository"
    fi
    
    # 9. Check TypeScript configuration
    print_header "9. TypeScript Configuration"
    
    if [ -f "tsconfig.json" ]; then
        print_success "Root tsconfig.json exists"
    else
        print_warning "Root tsconfig.json not found"
    fi
    
    # Check package TypeScript configs
    for package_dir in packages/*/; do
        if [ -d "$package_dir" ]; then
            package_name=$(basename "$package_dir")
            if [ -f "${package_dir}tsconfig.json" ]; then
                print_success "  TypeScript config exists for $package_name"
            else
                print_warning "  TypeScript config missing for $package_name"
            fi
        fi
    done
    
    # 10. Summary
    print_header "10. Verification Summary"
    
    echo -e "\nResults:"
    if [ $ERRORS -eq 0 ]; then
        print_success "No critical errors found! ✨"
    else
        print_error "$ERRORS critical error(s) found"
    fi
    
    if [ $WARNINGS -eq 0 ]; then
        print_success "No warnings"
    else
        print_warning "$WARNINGS warning(s) found"
    fi
    
    echo -e "\n${CYAN}Next Steps:${NC}"
    if [ $ERRORS -eq 0 ]; then
        echo "🎉 Foundation setup is complete!"
        echo "✅ Ready to proceed to Phase 1 (Authentication)"
        echo "💡 Run 'git tag foundation-complete' to mark this milestone"
    else
        echo "🔧 Please fix the critical errors before proceeding"
        echo "📖 Check the project documentation for setup instructions"
    fi
    
    # Exit with error code if there are critical errors
    if [ $ERRORS -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run main function
main "$@"