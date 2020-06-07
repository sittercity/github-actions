#!/bin/bash

# Suggested by Github actions to be strict
set -e
set -o pipefail
flyway $*
