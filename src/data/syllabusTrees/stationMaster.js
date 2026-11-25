/**
 * RRB Station Master — CEN 08/2026, para 15.1 "Syllabus For CBT" (PDF page 21,
 * sources/cen/examsDocuments.pdf). Every node below is a heading or item
 * printed in that paragraph; nothing is added beyond it. The only grouping
 * not printed as a separate line is Mathematics / Basic Science, which splits
 * the CEN heading "Basic Science & Mathematics" into its two named halves.
 * The CEN states the topics are "illustrative and not necessarily exhaustive".
 * Format: see engine.js.
 */

// 1) Basic Science, Mathematical and Analytical Capability (60 marks)
export const SM_SCIENCE_MATH = String.raw`
C basic_science_math | Basic Science & Mathematics | बुनियादी विज्ञान और गणित | sm_science_math.basic_science_math
T mathematics | Mathematics | गणित
M number_system | Number System | संख्या पद्धति
M ratio_proportion | Ratio & Proportions | अनुपात और समानुपात
M averages | Averages | औसत
M percentages | Percentages | प्रतिशत
M profit_loss_discount | Profit, Loss & Discounts | लाभ, हानि और छूट
M time_speed_distance | Time, Speed, Distance | समय, चाल, दूरी
M power_work | Power & Work | शक्ति और कार्य
M algebra | Algebra | बीजगणित
M linear_equations | Linear Equations | रैखिक समीकरण
M arithmetic_progression | Arithmetic Progression | समांतर श्रेढ़ी
M lcm_hcf | LCM, HCF | LCM, HCF
M geometry_trigonometry | Geometry and Trigonometry | ज्यामिति और त्रिकोणमिति
M area_volumes | Area & Volumes | क्षेत्रफल और आयतन
M probability | Probability (basic level) | प्रायिकता (मूल स्तर)
M statistics | Statistics (basic level) | सांख्यिकी (मूल स्तर)
T basic_science | Basic Science | बुनियादी विज्ञान
M units_measurements | Units, Measurements | मात्रक, मापन
M mass_weight_density | Mass, Weight and Density | द्रव्यमान, भार और घनत्व
M work_power_energy | Work, Power, Energy | कार्य, शक्ति, ऊर्जा
M kinetic_energy | Kinetic Energy | गतिज ऊर्जा
M friction | Friction | घर्षण
M speed_velocity | Speed, Velocity, Relative Velocity | चाल, वेग, सापेक्ष वेग
M heat_temperature | Heat and Temperature | ऊष्मा और ताप
M basic_electricity | Basic Electricity | बुनियादी विद्युत
M levers_machines | Levers and Simple Machines | उत्तोलक और सरल मशीनें

C data_analysis | Data Analysis & Interpretation | आँकड़ा विश्लेषण और निर्वचन | sm_science_math.data_analysis
T multi_source | Multi-source Data Analysis | बहु-स्रोत आँकड़ा विश्लेषण
M text_data | Inference from Text | पाठ से निष्कर्ष
M tabular_data | Tabular Data | सारणीबद्ध आँकड़े
M charts_graphs | Charts and Graphs | चार्ट और आलेख
M scatter_plot | Scatter Plot | प्रकीर्णन आलेख
M pie_chart | Pie Chart | पाई चार्ट
M statistical_distribution | Statistical Curve Distribution | सांख्यिकीय वक्र बंटन
T venn | Venn Diagrams | वेन आरेख
T data_sufficiency | Data Sufficiency | आँकड़ों की पर्याप्तता
T data_arrangement | Data Arrangement | आँकड़ा व्यवस्थापन
`;

// 2) Logical Capability (20 marks)
export const SM_LOGICAL = String.raw`
C logical_reasoning | Logical Reasoning | तार्किक विवेचन | sm_logical.logical_reasoning
M binary_logic | Binary Logic | द्विआधारी तर्क
M syllogism | Syllogism | न्याय निगमन
M clocks_calendars | Clocks & Calendars | घड़ी और कैलेंडर
M assumptions | Assumptions | पूर्वधारणाएँ
M blood_relations | Blood Relations | रक्त संबंध
M family_tree | Family Tree | वंश वृक्ष
M puzzles | Logic-based Puzzles | तर्क आधारित पहेलियाँ

C reading_comprehension | Reading Comprehension (English) | पठन बोध (अंग्रेज़ी) | sm_logical.reading_comprehension
M main_idea | Main Idea | मुख्य विचार
M supporting_idea | Supporting Idea | सहायक विचार
M application | Application | अनुप्रयोग
M structure_style | Logical Structure & Style | तार्किक संरचना और शैली
`;

// 3) Mental Reasoning (20 marks)
export const SM_MENTAL = String.raw`
C analogy | Analogy | सादृश्यता | sm_mental.analogy
C series_completion | Series Completion | श्रृंखला पूर्ति | sm_mental.series_completion
C coding_decoding | Coding-Decoding | कूटलेखन-कूटवाचन | sm_mental.coding_decoding
C ranking_arrangement | Ranking and Arrangements | रैंकिंग और व्यवस्था | sm_mental.ranking_arrangement
`;

const CEN = ['cen_08_2026'];
const official = { status: 'official', sources: CEN, verifiedAll: true, ref: 'CEN 08/2026, para 15.1' };

export const SM_MAPPING = {
  sm_science_math: { basic_science_math: official, data_analysis: official },
  sm_logical: { logical_reasoning: official, reading_comprehension: official },
  sm_mental: { analogy: official, series_completion: official, coding_decoding: official, ranking_arrangement: official },
};

export const SM_SUBJECT_NAMES = {
  sm_science_math: { en: 'Basic Science, Mathematical and Analytical Capability', hi: 'बुनियादी विज्ञान, गणितीय और विश्लेषणात्मक क्षमता' },
  sm_logical: { en: 'Logical Capability', hi: 'तार्किक क्षमता' },
  sm_mental: { en: 'Mental Reasoning', hi: 'मानसिक तर्क' },
};
