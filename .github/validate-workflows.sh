#!/bin/bash

# 🔍 GitHub Actions Workflow Validation Script
# This script validates the syntax of GitHub Actions workflow files
# Run this locally to check for bash syntax errors before committing

set -e

echo "🔍 Validating GitHub Actions workflow files..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to validate bash syntax in workflow files
validate_workflow_bash() {
    local workflow_file="$1"
    local temp_dir="/tmp/workflow-validation-$$"
    
    print_status "Validating bash syntax in $workflow_file..."
    
    mkdir -p "$temp_dir"
    
    # Extract bash scripts from workflow file
    # This is a simplified extraction - in practice, you'd want more sophisticated parsing
    awk '/run: \|/{flag=1; next} /^[ ]*- name:/{flag=0} flag' "$workflow_file" > "$temp_dir/extracted_script.sh"
    
    # Add bash shebang
    echo "#!/bin/bash" > "$temp_dir/test_script.sh"
    echo "set -e" >> "$temp_dir/test_script.sh"
    
    # Mock GitHub Actions environment variables for syntax checking
    cat >> "$temp_dir/test_script.sh" << 'EOF'
# Mock environment variables for syntax validation
export FIREBASE_API_KEY="mock-api-key"
export FIREBASE_AUTH_DOMAIN="mock-domain.firebaseapp.com"
export FIREBASE_PROJECT_ID="mock-project-id"
export FIREBASE_STORAGE_BUCKET="mock-bucket.firebasestorage.app"
export FIREBASE_MESSAGING_SENDER_ID="123456789"
export FIREBASE_APP_ID="1:123456789:web:abcdef"
export FIREBASE_MEASUREMENT_ID="G-ABCDEF123"
export FIREBASE_SERVICE_ACCOUNT='{"type": "service_account"}'

# Prevent actual execution of commands
alias npm=echo
alias mkdir=echo
alias cat=echo
alias echo=echo

EOF
    
    cat "$temp_dir/extracted_script.sh" >> "$temp_dir/test_script.sh"
    
    # Check bash syntax
    if bash -n "$temp_dir/test_script.sh" 2>/dev/null; then
        print_success "Bash syntax validation passed for $workflow_file"
    else
        print_error "Bash syntax errors found in $workflow_file"
        bash -n "$temp_dir/test_script.sh"
        return 1
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
}

# Function to check for common GitHub Actions issues
check_workflow_common_issues() {
    local workflow_file="$1"
    
    print_status "Checking for common issues in $workflow_file..."
    
    # Check for unquoted variable expansions that might cause issues
    if grep -n '\[\[ -z "${{' "$workflow_file" > /dev/null; then
        print_error "Found unquoted GitHub Actions variable expansion in conditionals"
        grep -n '\[\[ -z "${{' "$workflow_file"
        return 1
    fi
    
    # Check for proper environment variable usage
    if grep -n 'if \[ -z "${{' "$workflow_file" > /dev/null; then
        print_error "Found potentially problematic conditional syntax"
        grep -n 'if \[ -z "${{' "$workflow_file"
        return 1
    fi
    
    # Check for required environment variables in env blocks
    if grep -n 'secrets\.' "$workflow_file" | grep -v 'env:' > /dev/null; then
        print_warning "Found direct secret usage outside env blocks - consider using env vars"
    fi
    
    print_success "Common issues check passed for $workflow_file"
}

# Function to validate YAML syntax
validate_yaml_syntax() {
    local workflow_file="$1"
    
    print_status "Validating YAML syntax for $workflow_file..."
    
    if command -v yamllint > /dev/null 2>&1; then
        if yamllint "$workflow_file" > /dev/null 2>&1; then
            print_success "YAML syntax validation passed for $workflow_file"
        else
            print_error "YAML syntax errors found in $workflow_file"
            yamllint "$workflow_file"
            return 1
        fi
    elif command -v python3 > /dev/null 2>&1; then
        if python3 -c "import yaml; yaml.safe_load(open('$workflow_file'))" > /dev/null 2>&1; then
            print_success "YAML syntax validation passed for $workflow_file"
        else
            print_error "YAML syntax errors found in $workflow_file"
            python3 -c "import yaml; yaml.safe_load(open('$workflow_file'))"
            return 1
        fi
    else
        print_warning "No YAML validator found (yamllint or python3+yaml). Skipping YAML validation."
    fi
}

# Main validation function
main() {
    local exit_code=0
    
    # Check if we're in the right directory
    if [[ ! -d ".github/workflows" ]]; then
        print_error "No .github/workflows directory found. Run this script from the repository root."
        exit 1
    fi
    
    # Validate each workflow file
    for workflow_file in .github/workflows/*.yml .github/workflows/*.yaml; do
        if [[ -f "$workflow_file" ]]; then
            echo ""
            print_status "Validating $workflow_file"
            
            # Validate YAML syntax
            if ! validate_yaml_syntax "$workflow_file"; then
                exit_code=1
            fi
            
            # Check for common issues
            if ! check_workflow_common_issues "$workflow_file"; then
                exit_code=1
            fi
            
            # Validate bash syntax (simplified)
            if ! validate_workflow_bash "$workflow_file"; then
                exit_code=1
            fi
        fi
    done
    
    echo ""
    if [[ $exit_code -eq 0 ]]; then
        print_success "All workflow validations passed! ✅"
    else
        print_error "Some validations failed. Please fix the issues above. ❌"
    fi
    
    exit $exit_code
}

# Run main function
main "$@"