group_count = 2;
group_name = ["Group", "Pair"];
sample_list = ["MCB202001853", "MCB202001851", "MCB202001859", "MCB202001857", "MCB202001897", "MTB000003551", "MTB000000592", "MTB000000594", "MTB000003544", "MTB000003012", "MCB202001854", "MCB202001852", "MCB202001860", "MCB202001858", "MCB202001900"];
new_name = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5", "C1", "C2", "C3", "C4", "C5"];
group_list1 = ["A", "A", "A", "A", "A", "B", "B", "B", "B", "B", "C", "C", "C", "C", "C"];
group_list2 = ["P1", "P2", "P3", "P4", "P5", "P1", "P2", "P3", "P4", "P5", "P1", "P2", "P3", "P4", "P5"];

analysisInfo = {
  "targetRegion": "V3V4(Bakt_341F-805R)",
  "analysisTool": "ASV (DADA2)",
  "databaseTool": [
    "NCBI_16S (Bayesian)"
  ],
  "programVersion": [
    "NCBI_16S_20250524"
  ],
  "ccs": false,
  "single_end": false,
  "rawdata": false,
  "rawdata_length_trim": {
    "enabled": false,
    "forward": 0,
    "reverse": 0
  },
  "preprocess_length_trim": {
    "enabled": true,
    "forward": 250,
    "reverse": 200
  },
  "asvs_length_filter": {
    "enabled": true,
    "shortest": 350,
    "longest": null
  },
  "subsampling": true
};

array = {
  "organization": "(주)마크로젠",
  "name": "META사업부",
  "country": "Korea (the Republic of)",
  "curtime": "June 2026",
  "project": "HN00sample",
  "application": "Amplicon Metagenomic Sequencing Report",
  "appCode": "MAS",
  "numberofsample": 15,
  "page": [
    {
      "name": "RAWDATA REPORT",
      "category": false,
      "path": [
        {
          "path": "./src/page/Rawdata_report.html",
          "name": "RAWDATA REPORT",
          "display": true
        }
      ]
    },
    {
      "name": "QC Statistics",
      "category": false,
      "path": [
        {
          "path": "./src/page/Stat_summary.html",
          "name": "QC Statistics",
          "display": true
        }
      ]
    },
    {
      "name": "Taxonomy Analysis",
      "category": true,
      "path": [
        {
          "name": "Bayesian_NCBI_16S",
          "category": true,
          "path": [
            {
              "path": "./src/page/Taxonomy_krona_Bayesian_NCBI_16S.html",
              "name": "Krona Chart",
              "display": true
            },
            {
              "path": "./src/page/Taxonomy_krona_Bayesian_NCBI_16S_Group.html",
              "name": "Krona Chart - by Group",
              "display": true
            },
            {
              "path": "./src/page/Taxonomy_barplot_Bayesian_NCBI_16S.html",
              "name": "Barplot",
              "display": true
            },
            {
              "path": "./src/page/Taxonomy_barplot_Bayesian_NCBI_16S_Group.html",
              "name": "Barplot - by Group",
              "display": true
            },
            {
              "path": "./src/page/Taxonomy_heatmap_Bayesian_NCBI_16S.html",
              "name": "Heatmap",
              "display": true
            },
            {
              "path": "./src/page/Taxonomy_heatmap_Bayesian_NCBI_16S_Group.html",
              "name": "Heatmap - by Group",
              "display": true
            }
          ]
        }
      ]
    },
    {
      "name": "Diversity Analysis",
      "category": true,
      "path": [
        {
          "name": "Alpha diversity",
          "category": true,
          "path": [
            {
              "path": "./src/page/Diversity_alpha.html",
              "name": "Diversity Index",
              "display": true
            },
            {
              "path": "./src/page/Diversity_alpha_rarefaction.html",
              "name": "Rarefaction Curve",
              "display": true
            }
          ]
        },
        {
          "name": "Beta diversity",
          "category": true,
          "path": [
            {
              "path": "./src/page/Diversity_beta_DistanceMatrix.html",
              "name": "Distance Matrix",
              "display": true
            },
            {
              "path": "./src/page/Diversity_beta_UPGMA.html",
              "name": "UPGMA tree",
              "display": true
            },
            {
              "path": "./src/page/Diversity_beta.html",
              "name": "PCoA",
              "display": true
            }
          ]
        }
      ]
    },
    {
      "name": "Additional Analysis",
      "category": false,
      "path": [
        {
          "name": "Diversity Statistics",
          "category": true,
          "path": [
            {
              "path": "./src/page/Diversity_Statistics_alpha.html",
              "name": "Alpha Diversity",
              "display": true
            },
            {
              "path": "./src/page/Diversity_Statistics_beta.html",
              "name": "Beta Diversity",
              "display": true
            }
          ]
        },
        {
          "name": "LEfSe",
          "category": true,
          "path": [
            {
              "path": "./src/page/LEfSe_summary.html",
              "name": "Summary",
              "display": true
            },
            {
              "path": "./src/page/LEfSe_histogram.html",
              "name": "Histogram",
              "display": true
            },
            {
              "path": "./src/page/LEfSe_cladogram.html",
              "name": "Cladogram",
              "display": true
            }
          ]
        },
        {
          "name": "PICRUSt2",
          "category": true,
          "path": [
            {
              "name": "MetaCyc",
              "category": true,
              "path": [
                {
                  "path": "./src/page/PICRUST2_MetaCyc_summary.html",
                  "name": "Summary",
                  "display": true
                },
                {
                  "path": "./src/page/PICRUSt2_MetaCyc_Heatmap.html",
                  "name": "Heatmap",
                  "display": true
                },
                {
                  "path": "./src/page/PICRUSt2_MetaCyc_PCoA.html",
                  "name": "PCoA",
                  "display": true
                },
                {
                  "path": "./src/page/PICRUSt2_MetaCyc_Volcano.html",
                  "name": "Volcano",
                  "display": true
                }
              ]
            },
            {
              "name": "KEGG",
              "category": true,
              "path": [
                {
                  "path": "./src/page/PICRUSt2_KEGG_summary.html",
                  "name": "Summary",
                  "display": true
                },
                {
                  "path": "./src/page/PICRUSt2_KEGG_Heatmap.html",
                  "name": "Heatmap",
                  "display": true
                },
                {
                  "path": "./src/page/PICRUSt2_KEGG_PCoA.html",
                  "name": "PCoA",
                  "display": true
                },
                {
                  "path": "./src/page/PICRUSt2_KEGG_Volcano.html",
                  "name": "Volcano",
                  "display": true
                }
              ]
            }
          ]
        },
        {
          "name": "MaAsLin2",
          "category": true,
          "path": [
            {
              "path": "./src/page/MaAsLin_summary.html",
              "name": "Summary",
              "display": true
            },
            {
              "path": "./src/page/MaAsLin_Heatmap.html",
              "name": "Heatmap",
              "display": true
            },
            {
              "path": "./src/page/MaAslin_cladogram.html",
              "name": "Cladogram",
              "display": true
            }
          ]
        }
      ]
    },
    {
      "name": "Methods",
      "category": true,
      "path": [
        {
          "path": "./src/page/Methods.html",
          "name": "ASV analysis",
          "display": true
        },
        {
          "path": "./src/page/Methods_Adv.html",
          "name": "Additional analysis",
          "display": false
        }
      ]
    }
  ]
};

offices = [
  {
    "name": "MACROGEN Inc.",
    "address": "[08511] 1001, 10F, 254 Beotkkot-ro, Geumcheon-gu, Seoul, Republic of Korea (Gasan-dong, World Meridian 1)",
    "phone": "+82-2-2180-7000",
    "emails": [
      {
        "label": "Overseas",
        "email": "ngs@macrogen.com"
      },
      {
        "label": "Republic of Korea",
        "email": "ngskr@macrogen.com"
      }
    ],
    "links": [
      {
        "label": "Web",
        "url": "http://www.macrogen.com"
      },
      {
        "label": "LIMS",
        "url": "http://dna.macrogen.com"
      }
    ]
  },
  {
    "name": "PSOMAGEN",
    "address": "1330 Piccard Drive, Suite 103, Rockville, MD 20850, United States",
    "phone": "+1-301-251-1007",
    "emails": [
      {
        "label": "",
        "email": "inquiry@psomagen.com"
      }
    ],
    "links": []
  },
  {
    "name": "MACROGEN EUROPE",
    "address": "Meibergdreef 31, 1105 AZ, Amsterdam, the Netherlands",
    "phone": "+31-20-333-7563",
    "emails": [
      {
        "label": "",
        "email": "ngs@macrogen.eu"
      }
    ],
    "links": []
  },
  {
    "name": "MACROGEN JAPAN",
    "address": "16F Time24 Building, 2-4-32 Aomi, Koto-ku, Tokyo 135-0064 JAPAN",
    "phone": "+81-3-5962-1124",
    "emails": [
      {
        "label": "",
        "email": "ngs@macrogen-japan.co.jp"
      }
    ],
    "links": []
  },
  {
    "name": "MACROGEN SINGAPORE",
    "address": "3 Biopolis Drive #05-18, Synapse, Singapore 138623",
    "phone": "+65-6339-0927",
    "emails": [
      {
        "label": "",
        "email": "info-sg@macrogen.com"
      }
    ],
    "links": []
  },
  {
    "name": "MACROGEN SPAIN",
    "address": "Av. Sur del Aeropuerto de Barajas, 28, Office B-2, 28042 Madrid, Spain",
    "phone": "+34-911-138-378",
    "emails": [
      {
        "label": "",
        "email": "info-spain@macrogen.com"
      }
    ],
    "links": []
  }
];

const toolVersions = {
  "cutadapt": "3.2",
  "dada2": "1.18.0",
  "qiime": "1.9.0",
  "r": "4.0.3",
  "mafft": "7.475",
  "fasttree": "2.1.10",
  "blast": "2.9.0",
  "vsearch": "2.22.1"
};
