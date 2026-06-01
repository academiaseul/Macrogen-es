stat = [
    {'Sample Name': 'A1', 'Raw data': '59144', 'Adapter & Primer Trimming': '56978', 'Preprocessing Length Trimming': '56978', 'Quality Filter': '49285', 'denoisedFor': '45827', 'denoisedRev': '47555', 'mergedPair': '37259', 'non chimeric': '22880', 'ASV Length Filter': '22570'},
    {'Sample Name': 'A2', 'Raw data': '52778', 'Adapter & Primer Trimming': '50565', 'Preprocessing Length Trimming': '50565', 'Quality Filter': '45333', 'denoisedFor': '43619', 'denoisedRev': '44342', 'mergedPair': '36757', 'non chimeric': '20832', 'ASV Length Filter': '19170'},
    {'Sample Name': 'A3', 'Raw data': '61871', 'Adapter & Primer Trimming': '59292', 'Preprocessing Length Trimming': '59292', 'Quality Filter': '53925', 'denoisedFor': '52965', 'denoisedRev': '53140', 'mergedPair': '48861', 'non chimeric': '30228', 'ASV Length Filter': '29741'},
    {'Sample Name': 'A4', 'Raw data': '51221', 'Adapter & Primer Trimming': '49320', 'Preprocessing Length Trimming': '49320', 'Quality Filter': '44797', 'denoisedFor': '43736', 'denoisedRev': '44123', 'mergedPair': '41283', 'non chimeric': '35675', 'ASV Length Filter': '35663'},
    {'Sample Name': 'A5', 'Raw data': '58161', 'Adapter & Primer Trimming': '55611', 'Preprocessing Length Trimming': '55611', 'Quality Filter': '49765', 'denoisedFor': '48639', 'denoisedRev': '49064', 'mergedPair': '44424', 'non chimeric': '26331', 'ASV Length Filter': '26067'},
    {'Sample Name': 'B1', 'Raw data': '60045', 'Adapter & Primer Trimming': '57654', 'Preprocessing Length Trimming': '57654', 'Quality Filter': '50723', 'denoisedFor': '48613', 'denoisedRev': '49701', 'mergedPair': '42703', 'non chimeric': '33968', 'ASV Length Filter': '33968'},
    {'Sample Name': 'B2', 'Raw data': '46524', 'Adapter & Primer Trimming': '44370', 'Preprocessing Length Trimming': '44370', 'Quality Filter': '39227', 'denoisedFor': '37851', 'denoisedRev': '38370', 'mergedPair': '32805', 'non chimeric': '25387', 'ASV Length Filter': '25385'},
    {'Sample Name': 'B3', 'Raw data': '54545', 'Adapter & Primer Trimming': '52602', 'Preprocessing Length Trimming': '52602', 'Quality Filter': '46913', 'denoisedFor': '46123', 'denoisedRev': '46363', 'mergedPair': '43196', 'non chimeric': '34008', 'ASV Length Filter': '33999'},
    {'Sample Name': 'B4', 'Raw data': '57207', 'Adapter & Primer Trimming': '55093', 'Preprocessing Length Trimming': '55093', 'Quality Filter': '49992', 'denoisedFor': '49055', 'denoisedRev': '49393', 'mergedPair': '46470', 'non chimeric': '41442', 'ASV Length Filter': '41440'},
    {'Sample Name': 'B5', 'Raw data': '57705', 'Adapter & Primer Trimming': '55324', 'Preprocessing Length Trimming': '55324', 'Quality Filter': '49883', 'denoisedFor': '49134', 'denoisedRev': '49346', 'mergedPair': '46190', 'non chimeric': '35726', 'ASV Length Filter': '35708'},
    {'Sample Name': 'C1', 'Raw data': '55129', 'Adapter & Primer Trimming': '52279', 'Preprocessing Length Trimming': '52279', 'Quality Filter': '45556', 'denoisedFor': '43233', 'denoisedRev': '44396', 'mergedPair': '37228', 'non chimeric': '27949', 'ASV Length Filter': '27619'},
    {'Sample Name': 'C2', 'Raw data': '59847', 'Adapter & Primer Trimming': '57438', 'Preprocessing Length Trimming': '57438', 'Quality Filter': '51845', 'denoisedFor': '50160', 'denoisedRev': '50826', 'mergedPair': '43067', 'non chimeric': '31060', 'ASV Length Filter': '30702'},
    {'Sample Name': 'C3', 'Raw data': '61907', 'Adapter & Primer Trimming': '59529', 'Preprocessing Length Trimming': '59529', 'Quality Filter': '53606', 'denoisedFor': '52886', 'denoisedRev': '53050', 'mergedPair': '49977', 'non chimeric': '36897', 'ASV Length Filter': '35818'},
    {'Sample Name': 'C4', 'Raw data': '55601', 'Adapter & Primer Trimming': '53478', 'Preprocessing Length Trimming': '53478', 'Quality Filter': '46586', 'denoisedFor': '45326', 'denoisedRev': '45967', 'mergedPair': '42197', 'non chimeric': '35078', 'ASV Length Filter': '35073'},
    {'Sample Name': 'C5', 'Raw data': '56162', 'Adapter & Primer Trimming': '53584', 'Preprocessing Length Trimming': '53584', 'Quality Filter': '47204', 'denoisedFor': '46396', 'denoisedRev': '46650', 'mergedPair': '42901', 'non chimeric': '28186', 'ASV Length Filter': '27833'}
];

column_info = {
    "Raw data": "The raw read count from NGS platform",
    "Adapter & Primer Trimming": "The read count after adapter/primer trimming.",
    "Preprocessing Length Trimming": "The read count after preprocessing length trimming.",
    "Quality Filter": "The remaining read count after applying the DADA2 expected error criterion.",
    "denoisedFor": "The forward read count after being filtered using the DADA2 error model.",
    "denoisedRev": "The reverse read count after being filtered using the DADA2 error model.",
    "mergedPair": "The merged read count based on the DADA2 mergepairs function.",
    "non chimeric": "The read count after chimera removal using the DADA2 consensus method.",
    "ASV Length Filter": "The final read count after applying the length filter."
};
