#!/bin/bash

MD_FILE="summary/summary_table.md"
HTML_FILE="summary_table.html"

while read -r file
do
  [ -d "$file" ] && pandoc $file/$MD_FILE -t html -o $file/$HTML_FILE
done 
