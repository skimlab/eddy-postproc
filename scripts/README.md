# Batch processing

-- These are scripts to process multiple EDDY results at once

1. Follow the workflow described in **EDDY-postproc-example.Rmd** to generate **datasets** folder

   **EDDY-postproc-example.Rmd** is included in **workflow** folder.

   One will need to install https://github.com/skimlab/eddyR to run this workflow.
   
   
   This will generate all DDN graphs in PDF format (*output_dir*) and JSON format (*ddn_json_dir*), 
   and **summary_table.md** (*output_dir*).


2. Edit **summary_table.md** in *output_dir* folder (as specified in **EDDY-postproc-example.Rmd**) 
   to edit title, if needed.  This should be the first line of the file.

```
# Disease vs Normal (title)
```



