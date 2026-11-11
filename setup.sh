#!/usr/bin/env bash
set -e
cd "$(dirname "${BASH_SOURCE[0]}")"
npm ci
npx expo start
