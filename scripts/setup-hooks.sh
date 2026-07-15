#!/bin/bash
set -e

# Variables for console color
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

hookFiles=("pre-commit" "pre-push" "commit-msg")
ROOTDIR=$(git rev-parse --show-toplevel)
HOOKSDIR="$ROOTDIR/.git/hooks"
HOOKSSCRIPTDIR="$ROOTDIR/scripts/hooks"

print_info() {
  echo -e "${YELLOW}$1${NC}"
}
print_success() {
  echo -e "${GREEN}$1${NC}"
}

for hook in ${hookFiles[@]}; do
  TARGET="$HOOKSDIR/$hook"
  SOURCE="$HOOKSSCRIPTDIR/$hook"
  if [ -e "$TARGET" ]; then
    print_info "$TARGET exists, renaming to $hook.local"
    mv "$TARGET" "$TARGET.local"
  fi

  if [ -e "$SOURCE" ]; then
    print_info "Copying $hook to $HOOKSDIR"
    cp "$SOURCE" "$TARGET"
  fi

done

print_success "Git Hooks setup successful"