#!/usr/bin/env bash
# delete-all.sh — remove all CareAccess Bengaluru artefacts from watsonx Orchestrate
# Usage: bash scripts/delete-all.sh
# Requires: wxo CLI authenticated and targeting the correct environment.
# WARNING: This permanently deletes the agent and tool from the environment.

set -euo pipefail

echo "==> Deleting agent: care_navigator"
orchestrate agents remove -n care_navigator

echo "==> Deleting tool: clinic_lookup"
orchestrate tools remove -n clinic_lookup

echo "==> Delete complete."
