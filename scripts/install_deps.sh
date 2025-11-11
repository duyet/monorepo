#!/bin/bash

# Only run in Claude Code Web Remote environments
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  echo "Skipping dependency installation (not in remote environment)"
  exit 0
fi

echo "Installing dependencies with yarn..."
yarn install

exit 0
