# Workflow

1. Run R **-postproc.Rmd* to generate *datasets* folder
   **-postproc.Rmd* is included in *R-postproc* folder.

   This will generate all DDN graphs in JSON format, and *summary_table.md*.


2. Edit *summary_table.md* to edit title, like:

```
# GBAp PD vs GBAp Unaffected (title)
```

3. Convert *summary_table.md* to *summary_table.html*

```shell
pandoc summary_table.md -t html -o summary_table.html
```

4. Download ddn-cytoscape-js-template.zip into destination folder.
   The folder will include the following folders and files.
   1. *css* (folder)
   2. *js* (folder)
   3. *fonts* (folder)
   4. *stylesheets* (folder)
   5. index-template.html
   6. ddngraph.html

5. Rename *index-template.html* to *index.html*.  

6. Copy summary_table.html into the destination folder and 
   make necessary changes in *summary_table.html*.  Specifically,  
   one might need to change table column widths (proportions).  
   Make sure there is no column with **0**(%). 
   It is recommended to make 
   1. *pathway* column to large, like **40**(%)
   2. *DDN* and *n* columns to **1**(%)
   3. *mediator* columns to **8**(%)


7. Create *datasets* folder and copy all DDN graph JSON files into this folder.

8. Test the site and make necessary changes in
   1. *index.html* and 
   2. *summary_table.html*


