# Workflow

1. Follow the workflow described in **-postproc.Rmd* to generate *datasets* folder

   *EDDY-postproc-example.Rmd* is included in *workflow* folder.

   One will need to install https://github.com/skimlab/eddyR to run this workflow.
   
   
   This will generate all DDN graphs in PDF format (*output_dir*) and JSON format (*ddn_json_dir*), 
   and **summary_table.md** (*output_dir*).


2. Edit *summary_table.md* in *output_dir* folder (as specified in *EDDY-postproc-example.Rmd*) 
   to edit title, if needed.  This should be the first line of the file.

```
# Disease vs Normal (title)
```

3. In the command line, move to *output_dir* folder and run the following command to convert 
   *summary_table.md* to *summary_table.html* using a markdown converter.

```shell
pandoc summary_table.md -t html -o summary_table.html
```
If you don't have **pandoc** installed, please visit [Pandoc](https://pandoc.org) for installation instruction.


4. [Download this repository](https://github.com/skimlab/eddy-postproc/archive/refs/heads/main.zip) into your folder and copy those files and te folders in template folder into your destination folder.  Or these are the same files in *template* folder.  The folder will include the following folders and files.
   1. *css* (folder)
   2. *js* (folder)
   3. *fonts* (folder)
   4. *stylesheets* (folder)
   5. index-template.html
   6. ddngraph.html

5. Rename *index-template.html* to *index.html*.  

6. Copy **summary_table.html** in *summary* folder into the folder where **index.html** is and 
   make necessary changes in **summary_table.html**.  Specifically,  
   one might need to change table column widths (proportions).  
   Make sure there is no column with **0**(%). 
   It is recommended to make 
   1. *pathway* column to large, like **40**(%)
   2. *DDN* and *n* columns to **1**(%)
   3. *mediator* columns to **8**(%)
   4. the rest to between **2** and **6**(%)

   The proportions do not have to add up to 100%.


7. Create *datasets* folder inside the destination folder and copy all DDN graph JSON files into *datasets* folder.

8. Test the site and make necessary changes in
   1. *index.html* and 
   2. *summary_table.html*


