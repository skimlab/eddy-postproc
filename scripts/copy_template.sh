#!/bin/bash

TEMPLATE="eddy-postproc/template/*"
HTML_FILE="summary_table.html"

while read -r file
do
  if [ -d "$file" ] 
  then 
    cp -r $TEMPLATE $file
    ./replace_lines.sh $file/$HTML_FILE
  fi
done 
