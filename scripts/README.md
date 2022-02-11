# Batch processing

- These are scripts to process multiple EDDY results at once

1. First, make necessary changes in **eddy-postproc.R** to batch process multiple EDDY results.  This is simply a batch processing version of **EDDY-postproc-example.Rmd** included in **workflow** folder.

2. Run **pandoc_run.sh**
```
> pandoc_run.sh < `list_folder.txt`
```
This will convert summary_table.md in each folder to summary_table.html

3. Run **copy_template.sh**
```
> copy_template.sh < `list_folder.txt`
```
This will copy all the files in *template* folder to each folder.  
It will also apply decent column width info to all summary_table.html using **replace_lines.sh**.

