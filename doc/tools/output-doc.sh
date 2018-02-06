#!/usr/bin/env bash

SCRIPT_DIR=`dirname $0`

aglio -i $SCRIPT_DIR/../api.apib -o $SCRIPT_DIR/../output/api.html