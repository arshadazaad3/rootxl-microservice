#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh mongo:27020
cat .env
npm run seed:run:document
npm run start:prod
