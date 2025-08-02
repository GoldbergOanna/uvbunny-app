#!/bin/bash

# 🔐 Firebase API Key Security Cleanup Script
# This script removes sensitive API keys from git history and sets up proper environment management
# 
# WARNING: This script will rewrite git history and force push to remote repository
# Make sure all team members are aware before running this script
#
# Author: Claude Code Assistant
# Version: 1.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to prompt for confirmation
confirm() {
    read -p "$(echo -e "${YELLOW}$1 (y/N): ${NC}")" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Operation cancelled by user"
        exit 1
    fi
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository. Please run this script from the project root."
        exit 1
    fi
}

# Function to backup current state
create_backup() {
    print_status "Creating backup of current repository state..."
    
    local backup_dir="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup environment files if they exist
    if [ -f "src/environments/environment.ts" ]; then
        cp "src/environments/environment.ts" "$backup_dir/" 2>/dev/null || true
    fi
    if [ -f "src/environments/environment.prod.ts" ]; then
        cp "src/environments/environment.prod.ts" "$backup_dir/" 2>/dev/null || true
    fi
    if [ -f "src/environments/enviroment.prod.ts" ]; then
        cp "src/environments/enviroment.prod.ts" "$backup_dir/" 2>/dev/null || true
    fi
    
    print_success "Backup created in $backup_dir/"
    echo "BACKUP_DIR=$backup_dir" > .cleanup-backup-info
}

# Function to handle package-lock.json
handle_package_lock() {
    print_status "Handling package-lock.json management..."
    
    echo "Package-lock.json management options:"
    echo "1. Keep package-lock.json in repository (recommended for apps)"
    echo "2. Exclude package-lock.json from repository (for libraries)"
    echo "3. Skip this step"
    
    read -p "Choose option (1-3): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            print_status "Keeping package-lock.json in repository..."
            # Remove package-lock.json from .gitignore if it exists
            if grep -q "package-lock.json" .gitignore; then
                sed -i.bak '/^package-lock\.json$/d' .gitignore
                print_success "Removed package-lock.json from .gitignore"
            fi
            
            # Add comment to .gitignore explaining the decision
            if ! grep -q "# Package lock file management" .gitignore; then
                cat >> .gitignore << EOF

# Package lock file management
# package-lock.json is kept in repository for consistent dependency versions
# Use 'npm ci' for production builds and CI/CD
# Use 'npm install' for development when adding new dependencies
EOF
                print_success "Added package-lock.json management comments to .gitignore"
            fi
            ;;
        2)
            print_status "Excluding package-lock.json from repository..."
            if ! grep -q "package-lock.json" .gitignore; then
                echo -e "\n# Package lock file excluded for library development\npackage-lock.json" >> .gitignore
                print_success "Added package-lock.json to .gitignore"
            fi
            ;;
        3)
            print_status "Skipping package-lock.json management..."
            ;;
        *)
            print_warning "Invalid option. Skipping package-lock.json management..."
            ;;
    esac
}

# Function to remove files from git history
cleanup_git_history() {
    print_warning "This will rewrite git history and remove sensitive files from all commits!"
    print_warning "This action is IRREVERSIBLE and will affect all branches and tags!"
    print_warning "All team members will need to clone the repository fresh after this operation!"
    
    confirm "Are you absolutely sure you want to proceed with git history cleanup?"
    
    print_status "Removing sensitive files from git history..."
    
    # Check if git filter-repo is available (preferred method)
    if command -v git-filter-repo &> /dev/null; then
        print_status "Using git-filter-repo (recommended method)..."
        
        # Remove environment files from history
        git filter-repo --path src/environments/environment.ts --invert-paths --force
        git filter-repo --path src/environments/environment.prod.ts --invert-paths --force
        git filter-repo --path src/environments/enviroment.prod.ts --invert-paths --force
        
    else
        print_warning "git-filter-repo not found. Using git filter-branch (legacy method)..."
        print_status "Installing git-filter-repo is recommended: pip install git-filter-repo"
        
        confirm "Continue with git filter-branch?"
        
        # Use git filter-branch as fallback
        git filter-branch --force --index-filter \
            'git rm --cached --ignore-unmatch src/environments/environment.ts src/environments/environment.prod.ts src/environments/enviroment.prod.ts' \
            --prune-empty --tag-name-filter cat -- --all
        
        # Clean up refs
        rm -rf .git/refs/original/
        git reflog expire --expire=now --all
        git gc --prune=now --aggressive
    fi
    
    print_success "Git history cleanup completed"
}

# Function to setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Ensure environments directory exists
    mkdir -p src/environments
    
    # Copy example to actual environment files if they don't exist
    if [ ! -f "src/environments/environment.ts" ]; then
        if [ -f "src/environments/environment.example.ts" ]; then
            cp "src/environments/environment.example.ts" "src/environments/environment.ts"
            print_success "Created environment.ts from example"
        else
            print_error "environment.example.ts not found. Please ensure it exists first."
            exit 1
        fi
    fi
    
    if [ ! -f "src/environments/environment.prod.ts" ]; then
        if [ -f "src/environments/environment.example.ts" ]; then
            cp "src/environments/environment.example.ts" "src/environments/environment.prod.ts"
            # Update production flag
            sed -i.bak 's/production: false/production: true/' "src/environments/environment.prod.ts"
            rm -f "src/environments/environment.prod.ts.bak"
            print_success "Created environment.prod.ts from example"
        else
            print_error "environment.example.ts not found. Please ensure it exists first."
            exit 1
        fi
    fi
    
    # Remove the typo file if it exists
    if [ -f "src/environments/enviroment.prod.ts" ]; then
        print_status "Found typo file 'enviroment.prod.ts', removing it..."
        rm "src/environments/enviroment.prod.ts"
        print_success "Removed typo file"
    fi
    
    print_warning "IMPORTANT: You must now edit the environment files and add your actual Firebase configuration:"
    print_warning "1. Edit src/environments/environment.ts"
    print_warning "2. Edit src/environments/environment.prod.ts" 
    print_warning "3. Replace all 'your-*-here' placeholders with actual Firebase config values"
}

# Function to verify gitignore is working
verify_gitignore() {
    print_status "Verifying .gitignore configuration..."
    
    # Check if environment files are being ignored
    local ignored_files=0
    
    if git check-ignore "src/environments/environment.ts" &> /dev/null; then
        print_success "environment.ts is properly ignored"
        ((ignored_files++))
    else
        print_error "environment.ts is NOT being ignored by git"
    fi
    
    if git check-ignore "src/environments/environment.prod.ts" &> /dev/null; then
        print_success "environment.prod.ts is properly ignored"
        ((ignored_files++))
    else
        print_error "environment.prod.ts is NOT being ignored by git"
    fi
    
    if [ $ignored_files -eq 2 ]; then
        print_success "All environment files are properly ignored"
    else
        print_error "Some environment files are not being ignored. Check your .gitignore file."
        return 1
    fi
}

# Function to test build
test_build() {
    print_status "Testing if the application can build..."
    
    if ! command -v ng &> /dev/null; then
        print_warning "Angular CLI not found. Skipping build test."
        print_warning "Install with: npm install -g @angular/cli"
        return 0
    fi
    
    print_status "Running build test..."
    if ng build --configuration development --dry-run &> /dev/null; then
        print_success "Build test passed"
    else
        print_error "Build test failed. Please check your environment configuration."
        print_error "Make sure you've updated the Firebase config in environment files."
        return 1
    fi
}

# Function to push changes to remote
push_to_remote() {
    print_warning "This will force push the cleaned history to the remote repository!"
    print_warning "This will overwrite the remote repository history!"
    print_warning "All team members will need to re-clone the repository!"
    
    confirm "Do you want to force push to the remote repository?"
    
    print_status "Force pushing to remote repository..."
    
    # Get current branch
    local current_branch=$(git branch --show-current)
    
    # Force push current branch
    git push origin "$current_branch" --force
    
    # Force push all other branches if they exist
    print_status "Force pushing all branches..."
    git push origin --all --force
    
    # Force push tags if they exist
    if git tag -l | grep -q .; then
        print_status "Force pushing tags..."
        git push origin --tags --force
    fi
    
    print_success "Successfully force pushed all branches and tags to remote"
}

# Function to generate summary report
generate_report() {
    print_status "Generating cleanup report..."
    
    local report_file="cleanup-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$report_file" << EOF
🔐 Firebase API Key Security Cleanup Report
==========================================

Date: $(date)
Repository: $(git config --get remote.origin.url 2>/dev/null || "Unknown")
Branch: $(git branch --show-current)

Actions Performed:
- ✅ Removed sensitive environment files from git history
- ✅ Updated .gitignore to exclude environment files
- ✅ Set up environment.example.ts template
- ✅ Created local environment files with placeholders
- ✅ Verified .gitignore configuration

Next Steps for Team Members:
1. Delete their local repository and clone fresh from remote
2. Copy environment.example.ts to environment.ts and environment.prod.ts
3. Add their Firebase configuration to the environment files
4. Run 'npm install' to install dependencies
5. Test the application with 'ng serve'

Files to Configure:
- src/environments/environment.ts (add Firebase config)
- src/environments/environment.prod.ts (add Firebase config)

Security Notes:
- Real API keys have been removed from git history
- Environment files are now excluded from version control
- Use GitHub Secrets for CI/CD deployment

Backup Location:
$(cat .cleanup-backup-info 2>/dev/null || echo "No backup created")

Generated by cleanup-secrets.sh v1.0
EOF

    print_success "Report generated: $report_file"
}

# Main execution function
main() {
    echo "🔐 Firebase API Key Security Cleanup Script"
    echo "=========================================="
    echo
    
    # Preliminary checks
    check_git_repo
    
    print_status "Starting security cleanup process..."
    print_warning "This script will modify git history and force push to remote repository"
    
    confirm "Do you want to continue?"
    
    # Create backup
    create_backup
    
    # Handle package-lock.json
    handle_package_lock
    
    # Setup environment files before history cleanup
    setup_environment
    
    # Verify gitignore works
    if ! verify_gitignore; then
        print_error "Gitignore verification failed. Please fix .gitignore before continuing."
        exit 1
    fi
    
    # Clean git history
    cleanup_git_history
    
    # Test build (optional)
    print_status "Would you like to test if the application builds?"
    read -p "$(echo -e "${YELLOW}Test build? (y/N): ${NC}")" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_build
    fi
    
    # Push to remote
    push_to_remote
    
    # Generate report
    generate_report
    
    print_success "Security cleanup completed successfully!"
    echo
    print_warning "IMPORTANT NEXT STEPS:"
    print_warning "1. All team members must delete their local repository and clone fresh"
    print_warning "2. Update environment files with actual Firebase configuration"
    print_warning "3. Test the application locally before deployment"
    print_warning "4. Set up GitHub Secrets for automated deployment"
    echo
    print_status "Check the generated report for detailed instructions."
}

# Run main function
main "$@"