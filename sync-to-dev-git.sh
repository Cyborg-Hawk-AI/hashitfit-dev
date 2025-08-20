#!/bin/bash

# HashimFit Git Sync Script
# This script syncs your local changes to the GitHub hashitfit-dev repository
# ONE-WAY PUSH ONLY - Never fetches from GitHub

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[SYNC]${NC} $1"
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

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please run this script from the project root."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check if we have any commits
if ! git rev-parse HEAD > /dev/null 2>&1; then
    print_warning "No commits found. This appears to be a new repository."
    print_status "Setting up initial commit..."
    
    # Add all files
    git add .
    
    # Create initial commit
    git commit -m "Initial commit: HashimFit development setup"
    print_success "Created initial commit"
fi

# Check if we have a remote configured
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "No remote 'origin' configured. Setting up hashitfit-dev remote..."
    
    # Set up the remote
    git remote add origin "https://github.com/Cyborg-Hawk-AI/hashitfit-dev.git"
    print_success "Added remote origin: https://github.com/Cyborg-Hawk-AI/hashitfit-dev.git"
else
    # Get remote URL
    REMOTE_URL=$(git remote get-url origin)
    print_status "Current remote URL: $REMOTE_URL"

    # Check if we're on the correct remote repository
    EXPECTED_REMOTE="https://github.com/Cyborg-Hawk-AI/hashitfit-dev.git"
    if [[ "$REMOTE_URL" != "$EXPECTED_REMOTE" ]]; then
        print_warning "Remote URL doesn't match expected hashitfit-dev repository"
        print_warning "Expected: $EXPECTED_REMOTE"
        print_warning "Current:  $REMOTE_URL"
        
        read -p "Do you want to update the remote to point to hashitfit-dev? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Updating remote origin to hashitfit-dev..."
            git remote set-url origin "$EXPECTED_REMOTE"
            print_success "Remote updated successfully"
        else
            print_error "Remote URL mismatch. Please update manually or confirm the correct repository."
            exit 1
        fi
    fi
fi

# Always switch to main branch
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    print_status "Switching to main branch..."
    if git show-ref --verify --quiet refs/heads/main; then
        git checkout main
    else
        git checkout -b main
    fi
    CURRENT_BRANCH="main"
    print_success "Switched to main branch"
fi

# Check if we have changes to commit
if git diff-index --quiet HEAD --; then
    print_warning "No changes to commit. Repository is up to date."
    
    # Check if we need to push to remote
    if git ls-remote --exit-code origin main > /dev/null 2>&1; then
        LOCAL_COMMIT=$(git rev-parse HEAD)
        REMOTE_COMMIT=$(git ls-remote origin main | cut -f1)
        
        if [[ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]]; then
            print_status "Local and remote are out of sync. Pushing local changes..."
            git push origin main
            print_success "Pushed local changes to remote"
        else
            print_success "Repository is already in sync with remote"
        fi
    else
        print_status "Remote branch doesn't exist. Pushing for the first time..."
        git push -u origin main
        print_success "Pushed to remote for the first time"
    fi
    exit 0
fi

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Get list of changed files
CHANGED_FILES=$(git status --porcelain | wc -l)
print_status "Found $CHANGED_FILES changed file(s)"

# Show what files are changed
print_status "Changed files:"
git status --porcelain | sed 's/^/  /'

# Add all changes
print_status "Adding all changes..."
git add .

# Create commit message with timestamp
COMMIT_MESSAGE="sync: Auto-sync changes - $TIMESTAMP"

# Check if we have staged changes
if git diff --cached --quiet; then
    print_warning "No changes to commit after staging."
    exit 0
fi

# Commit changes
print_status "Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# Get commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
print_success "Committed changes with hash: $COMMIT_HASH"

# Force push to main branch (ONE-WAY PUSH ONLY)
print_status "Force pushing changes to main branch..."
if git push --force-with-lease origin main; then
    print_success "Successfully force pushed changes to main branch"
else
    print_error "Failed to push changes. Please check your remote configuration."
    exit 1
fi

# Show final status
print_status "Repository sync complete!"
print_status "Branch: main"
print_status "Commit: $COMMIT_HASH"
print_status "Remote: $(git remote get-url origin)"

echo ""
print_success "✅ Sync completed successfully!" 
