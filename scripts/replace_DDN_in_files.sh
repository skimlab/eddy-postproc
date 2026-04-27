#!/bin/bash

HTML_FILE="summary_table.html"

while read -r file
do
  [ -d "$file" ] && sed -i '' "s/>DDN<\/a>/><img src=\"ddn.svg\" alt=\"DDN\" style=\"width:auto;height:1.5em;\">/g" $file/$HTML_FILE
done 
