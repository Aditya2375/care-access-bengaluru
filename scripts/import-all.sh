#!/usr/bin/env bash
# import-all.sh — import all CareAccess Bengaluru artefacts into watsonx Orchestrate
# Usage: bash scripts/import-all.sh
# Requires: wxo CLI authenticated and targeting the correct environment.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "==> Importing tool: clinic_lookup"
orchestrate tools import -k python -f "${ROOT_DIR}/tools/clinic_lookup.py"

echo "==> Importing agent: care_navigator"
orchestrate agents import -f "${ROOT_DIR}/agent/care_navigator.yaml"

echo "==> Import complete."
