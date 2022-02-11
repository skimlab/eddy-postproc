library(eddyR)
library(jsonlite)
library(knitr)

#
RUN_CONFIG <- list(
    EDDY_analysis_basedir = "./eddy-analysis/reactome",
    EDDY_postproc_basedir = "./postproc/reactome",
    DDN_prefix = "DDNS_reactome_p0_05",
    summary_prefix = "summary_table_reactome_mediator_tbl",
    comparison_cases = c(
        "treatment-naive_vs_HC",
        "PDE5_vs_HC",
        "PDE5_vs_treatment-naive",
        "PDE5+macitentan_vs_HC",
        "PDE5+macitentan_vs_treatment-naive",
        "PDE5+macitentan_vs_PDE5"
    ),
    cell_types = c(
        "B",
        "CD4",
        "CD8",
        "Monocytes",
        "NK"
    ),
    subtypes = c(
        "iPAH+sPAH",
        "iPAH",
        "sPAH"
    )
)

# Set up folders
target_case <- RUN_CONFIG$comparison_cases[1]
subtype <- RUN_CONFIG$subtypes[1]
celltype <- RUN_CONFIG$cell_types[1]

target_case_dirs <-
    file.path("./eddy-analysis/reactome", target_case, subtype) %>%
    dir()

eddy_case_basedir <- file.path(
    target_case, subtype,
    target_case_dirs[1]
)

parse_basedir <- function(basedir, celltypes) {
    sapply(celltypes, function(c, t) {
        grepl(sprintf("_%s$", c), t)
    }, basedir) -> celltype_loc

    if (!isFALSE(celltype_loc)) {
        celltype <- celltypes[celltype_loc]
    } else {
        stop("no matching cell type")
    }
    basedir <-
        sub(sprintf("_%s$", celltype), "", basedir) %>%
        strsplit(split = "_vs_") %>%
        unlist()

    list(
        conditions = basedir,
        pre = basedir[1],
        post = basedir[2],
        celltype = celltype
    )
}

for (target_case in RUN_CONFIG$comparison_cases) {
    for (subtype in RUN_CONFIG$subtypes) {
        target_case_dirs <-
            file.path(RUN_CONFIG$EDDY_analysis_basedir, target_case, subtype) %>%
            dir()
        for (an_eddy_dir in target_case_dirs) {
            eddy_case_basedir <- file.path(
                target_case, subtype,
                an_eddy_dir
            )

            # mapping sample/filenames to conditions
            basedir_parsed <-
                parse_basedir(
                    basename(eddy_case_basedir),
                    RUN_CONFIG$cell_types
                )

            mapping_conditions_names <- basedir_parsed$conditions
            mapping_conditions <-
                strsplit(target_case, split = "_vs_") %>%
                unlist()

            names(mapping_conditions) <- mapping_conditions_names

            input_dir <- file.path(RUN_CONFIG$EDDY_analysis_basedir, eddy_case_basedir)
            output_dir <- file.path(RUN_CONFIG$EDDY_postproc_basedir, eddy_case_basedir, "summary")
            ddn_json_dir <- file.path(RUN_CONFIG$EDDY_postproc_basedir, eddy_case_basedir, "datasets")

            print(input_dir)
            #
            eddy_postproc <- post_proc_EDDY_folder(
                eddy_run_dir = input_dir,
                create_ddn_graph = TRUE,
                db_name_prefix = "REACTOME",
                mapping_conditions = mapping_conditions
            )

            #
            write_eddy_postproc_to_csv(eddy_postproc, output_dir = output_dir)
            #
            write_eddy_postproc_DDN_to_pdf(eddy_postproc, output_dir = output_dir)

            #
            eddy_postproc <- write_eddy_postproc_DDN_to_json(eddy_postproc, json_dir = ddn_json_dir)

            #
            eddy_postproc <- write_eddy_summary_table_markdown(eddy_postproc, output_dir = output_dir)
        }
    }
}
