# Workflow

1. Run R **-postproc.Rmd* to generate *datasets* folder
   **-postproc.Rmd* is included in *R-postproc* folder.
   
2. Convert *summary_table.md* to *summary_table.html*

```shell
pandoc summary_table.md -t html -o summary_table.html
```

3. Edit *index_template.html* to change the study title, C1 vs. C2 and save it as *index.html*

4. Test *index.html* and *summary_table.html* and make necessay changes.  
   For example, one might need to change table column widths (proportions).

5. Copy the following folders to destination:
   1. *css*
   2. *js*
   3. *fonts*
   4. *stylesheets*
   5. *datasets* -- this holds all DDNgraph JSON files

6. Copy the following files to destination:
   1. *index.html*
   2. *summary_table.html*
   3. *ddngraph.html*

