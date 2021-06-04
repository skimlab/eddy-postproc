# Workflow

1. Run R **-postproc.Rmd* to generate *datasets* folder
   **-postproc.Rmd* is included in *R-postproc* folder.

   This will generate all DDN graphs in JSON format, and *summary_table.md*.


2. Edit *summary_table.md* to add title and links to aggregated DDNs, like:

```
# GBAp PD vs GBAp Unaffected (title)

### Aggregated DDNs (could be slow)

<a href="ddngraph.html?DDN=aggregated_p0_05" target="_blank">DDNs (P.val < 0.05)</a> |
<a href="ddngraph.html?DDN=aggregated_p0_10" target="_blank">DDNs (P.val < 0.10)</a>
```

3. Convert *summary_table.md* to *summary_table.html*

```shell
pandoc summary_table.md -t html -o summary_table.html
```

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

