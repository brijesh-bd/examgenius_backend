/**
 * SSC concept libraries. Chapter/topic names follow the official SSC
 * notification wording (see ./sscExams.js for each exam's mapping, source
 * URL, page and para). Format: see engine.js.
 *   C slug | English | Hindi | legacyTopicId|- [| fig]
 * `fig` = needs a figure/image → hidden from text-MCQ practice.
 * Nodes not printed in a notification are mapped as 'supplementary'.
 */

// General Intelligence & Reasoning — union of the items listed across SSC
// notices (CGL 13.10/13.11, CHSL 13.10, CPO 12.8, MTS 14.6, GD 12.1, JE 14.2,
// Steno 14, Selection Post 15.9). Each exam maps only the items it lists.
export const SSC_REASONING = String.raw`
C semantic_analogy | Semantic Analogy | शाब्दिक सादृश्यता | reasoning.analogy
T word_relation | Word Relationship Types | शब्द संबंध के प्रकार
M synonym_antonym | Synonym / Antonym Relation | पर्याय / विलोम संबंध
M part_whole | Part–Whole, Worker–Tool, Cause–Effect | अंश–पूर्ण, कार्यकर्ता–औज़ार, कारण–प्रभाव
M gk_based | Knowledge-based Pairs | ज्ञान आधारित युग्म
C number_analogy | Symbolic/Number Analogy | प्रतीकात्मक/संख्या सादृश्यता | reasoning.analogy
T arithmetic | Arithmetic Relation | अंकगणितीय संबंध
M operations | Add / Subtract / Multiply / Divide | योग / व्यवकलन / गुणा / भाग
M powers | Squares, Cubes and Roots | वर्ग, घन और मूल
T letter_number | Letter–Number Analogy | अक्षर–संख्या सादृश्यता
M letter_position | Letter Positions | अक्षर स्थितियाँ
C figural_analogy | Figural Analogy | आकृति सादृश्यता | - | fig
C semantic_classification | Semantic Classification | शाब्दिक वर्गीकरण | reasoning.classification
C number_classification | Symbolic/Number Classification | प्रतीकात्मक/संख्या वर्गीकरण | reasoning.classification
C figural_classification | Figural Classification | आकृति वर्गीकरण | - | fig
C semantic_series | Semantic Series | शाब्दिक श्रृंखला | reasoning.number_letter_series
T letter_series | Letter and Word Series | अक्षर और शब्द श्रृंखला
M letter_pattern | Letter Pattern | अक्षर पैटर्न
C number_series | Number Series | संख्या श्रृंखला | reasoning.number_letter_series
T patterns | Series Patterns | श्रृंखला पैटर्न
M difference | Difference-based | अंतर आधारित
M ratio | Ratio / Multiplication-based | अनुपात / गुणन आधारित
M squares_cubes | Squares and Cubes | वर्ग और घन
M alternate | Alternate / Mixed | एकांतर / मिश्रित
T question_type | Question Type | प्रश्न प्रकार
M missing_term | Missing Term | लुप्त पद
M wrong_term | Wrong Term | गलत पद
C alpha_numeric_series | Alpha-Numeric Series | अक्षर-संख्या श्रृंखला | reasoning.number_letter_series
C figural_series | Figural Series | आकृति श्रृंखला | - | fig
C non_verbal_series | Non-verbal Series | अशाब्दिक श्रृंखला | - | fig
C problem_solving | Problem Solving | समस्या समाधान | -
C word_building | Word Building | शब्द निर्माण | -
C coding_decoding | Coding & De-coding | कूटलेखन और कूटवाचन | reasoning.coding_decoding
T letter_coding | Letter Coding | अक्षर कूटलेखन
M shift | Letter Shift | अक्षर विस्थापन
M reverse_opposite | Reverse / Opposite Letters | उल्टा / विपरीत अक्षर
T number_coding | Number Coding | संख्या कूटलेखन
M position_values | Letter Position Values | अक्षर स्थिति मान
T sentence_coding | Sentence / Symbol Coding | वाक्य / प्रतीक कूटलेखन
M common_word | Common-word Method | सामान्य शब्द विधि
C numerical_operations | Numerical Operations | संख्यात्मक संक्रियाएँ | reasoning.mathematical_operations
C symbolic_operations | Symbolic Operations | प्रतीकात्मक संक्रियाएँ | reasoning.mathematical_operations
C trends | Trends | प्रवृत्तियाँ | -
C space_orientation | Space Orientation | स्थान अभिविन्यास | reasoning.direction_sense
C space_visualization | Space Visualization | स्थान दृश्यता | - | fig
C venn_diagrams | Venn Diagrams | वेन आरेख | reasoning.venn_diagrams
C drawing_inferences | Drawing Inferences | निष्कर्ष निकालना | reasoning.statement_conclusion
C punched_hole | Punched Hole / Pattern Folding & Unfolding | छिद्रित / पैटर्न मोड़ना और खोलना | - | fig
C pattern_folding | Figural Pattern Folding and Completion | आकृति पैटर्न मोड़ना और पूर्ति | - | fig
C indexing | Indexing | अनुक्रमण | -
C address_matching | Address Matching | पता मिलान | -
C date_city_matching | Date & City Matching | तारीख और शहर मिलान | -
C centre_codes | Classification of Centre Codes / Roll Numbers | केंद्र कोड / अनुक्रमांक वर्गीकरण | -
C small_capital_coding | Small & Capital Letters / Numbers Coding, Decoding and Classification | छोटे और बड़े अक्षर / संख्या कूटलेखन, कूटवाचन और वर्गीकरण | -
C embedded_figures | Embedded Figures | अंतर्निहित आकृतियाँ | - | fig
C critical_thinking | Critical Thinking | आलोचनात्मक चिंतन | -
C emotional_intelligence | Emotional Intelligence | भावनात्मक बुद्धिमत्ता | -
C social_intelligence | Social Intelligence | सामाजिक बुद्धिमत्ता | -
C similarities_differences | Similarities and Differences | समानताएँ और अंतर | -
C statement_conclusion | Statement Conclusion | कथन निष्कर्ष | reasoning.statement_conclusion
C syllogistic_reasoning | Syllogistic Reasoning | न्याय निगमन तर्क | reasoning.syllogism
C decision_making | Analysis, Judgment and Decision Making | विश्लेषण, निर्णय और निर्णयन | -
C relationship_concepts | Relationship Concepts | संबंध अवधारणाएँ | reasoning.blood_relations
T blood_relations | Blood Relations | रक्त संबंध
M family | Family Relations | पारिवारिक संबंध
C arithmetical_reasoning | Arithmetical Reasoning and Computation | अंकगणितीय तर्क और गणना | -
C visual_memory | Visual Memory | दृश्य स्मृति | - | fig
C discrimination_observation | Discrimination and Observation | विभेदन और अवलोकन | - | fig
C following_directions | Following Directions | दिशाओं का अनुसरण | reasoning.direction_sense
C jumbling | Jumbling | शब्द व्यवस्थापन | -
C non_verbal_diagrams | Non-verbal Reasoning based on Diagrams | आरेख आधारित अशाब्दिक तर्क | reasoning.non_verbal | fig
C age_calculations | Age Calculations | आयु गणना | -
C calendar_clock | Calendar and Clock | कैलेंडर और घड़ी | reasoning.calendar_clock
`;

// Quantitative Aptitude / Mathematical Abilities / Numerical Ability /
// Elementary Mathematics — the SSC items, grouped as CGL Tier-II para 13.11
// groups them. Each exam maps only the items its notification lists.
export const SSC_QUANT = String.raw`
C number_systems | Number Systems | संख्या पद्धति | quant.number_system
T whole_numbers | Computation of Whole Numbers | पूर्ण संख्याओं की गणना
T decimals_fractions | Decimals and Fractions | दशमलव और भिन्न
T relationship_numbers | Relationship between Numbers | संख्याओं के बीच संबंध
T integers_whole | Integers and Whole Numbers | पूर्णांक और पूर्ण संख्याएँ
T lcm_hcf | LCM and HCF | LCM और HCF
T bodmas | Fundamental Arithmetic Operations and BODMAS | मूल अंकगणितीय संक्रियाएँ और BODMAS
C arithmetic | Fundamental Arithmetical Operations | मूल अंकगणितीय संक्रियाएँ | -
T percentage | Percentages | प्रतिशत
T ratio_proportion | Ratio and Proportion | अनुपात और समानुपात
T direct_inverse | Direct and Inverse Proportions | प्रत्यक्ष और व्युत्क्रम समानुपात
T square_roots | Square Roots | वर्गमूल
T averages | Averages | औसत
T interest_simple | Simple Interest | साधारण ब्याज
T interest_compound | Compound Interest | चक्रवृद्धि ब्याज
T profit_loss | Profit and Loss | लाभ और हानि
T discount | Discount | छूट
T partnership | Partnership Business | साझेदारी व्यापार
T mixture_alligation | Mixture and Alligation | मिश्रण और एलीगेशन
T time_distance | Time and Distance | समय और दूरी
T time_work | Time and Work | समय और कार्य
T ratio_time | Ratio and Time | अनुपात और समय
C algebra | Algebra | बीजगणित | quant.algebra
T identities_surds | Basic Algebraic Identities of School Algebra and Elementary Surds | स्कूल बीजगणित की मूल सर्वसमिकाएँ और प्रारंभिक करणी
T linear_graphs | Graphs of Linear Equations | रैखिक समीकरणों के आलेख
C geometry | Geometry | ज्यामिति | quant.geometry
T elementary_figures | Elementary Geometric Figures and Facts | प्रारंभिक ज्यामितीय आकृतियाँ और तथ्य
T lines_angles | Lines and Angles | रेखाएँ और कोण
T triangle_centres | Triangle and its Various Kinds of Centres | त्रिभुज और उसके विभिन्न केंद्र
T congruence_similarity | Congruence and Similarity of Triangles | त्रिभुजों की सर्वांगसमता और समरूपता
T circle_chords_tangents | Circle: Chords, Tangents, Angles Subtended, Common Tangents | वृत्त: जीवाएँ, स्पर्श रेखाएँ, अंतरित कोण, उभयनिष्ठ स्पर्श रेखाएँ
C mensuration | Mensuration | क्षेत्रमिति | quant.mensuration
T plane_figures | Triangle, Quadrilaterals, Regular Polygons, Circle | त्रिभुज, चतुर्भुज, सम बहुभुज, वृत्त
T solids | Right Prism, Cone, Cylinder, Sphere, Hemisphere, Parallelepiped, Pyramid | लंब प्रिज्म, शंकु, बेलन, गोला, अर्धगोला, समांतर षट्फलक, पिरामिड
T area_perimeter_basic | Area and Perimeter of Basic Geometric Figures | मूल ज्यामितीय आकृतियों का क्षेत्रफल और परिमाप
C trigonometry | Trigonometry | त्रिकोणमिति | quant.trigonometry
T trig_ratios | Trigonometric Ratios | त्रिकोणमितीय अनुपात
T degree_radian | Degree and Radian Measures | डिग्री और रेडियन माप
T standard_identities | Standard Identities | मानक सर्वसमिकाएँ
T complementary_angles | Complementary Angles | पूरक कोण
T heights_distances | Heights and Distances | ऊँचाई और दूरी
C statistics | Statistics, Probability and Data | सांख्यिकी, प्रायिकता और आँकड़े | quant.data_interpretation
T statistical_charts | Histogram, Frequency Polygon, Bar Diagram, Pie Chart | आयतचित्र, बारंबारता बहुभुज, दंड आरेख, पाई चार्ट
T tables_graphs | Use of Tables and Graphs / Interpretation of Simple Graphs and Data | सारणी और आलेखों का उपयोग / सरल आलेख और आँकड़ों का निर्वचन
T central_tendency | Mean, Median, Mode | माध्य, माध्यिका, बहुलक
T standard_deviation | Standard Deviation | मानक विचलन
T probability | Calculation of Simple Probabilities | सरल प्रायिकताओं की गणना
`;

// CGL / CHSL Tier-II Computer Knowledge Module (CGL 13.11, CHSL 13.11).
export const SSC_COMPUTER = String.raw`
C computer_basics | Computer Basics | कंप्यूटर की मूल बातें | computer.fundamentals
M organisation | Organization of a Computer | कंप्यूटर का संगठन
M cpu | Central Processing Unit (CPU) | केंद्रीय प्रसंस्करण इकाई (CPU)
M io_devices | Input / Output Devices | इनपुट / आउटपुट उपकरण
M memory | Computer Memory and Memory Organization | कंप्यूटर मेमोरी और मेमोरी संगठन
M backup | Back-up Devices | बैक-अप उपकरण
M ports | Ports | पोर्ट
M windows_explorer | Windows Explorer | विंडोज़ एक्सप्लोरर
M shortcuts | Keyboard Shortcuts | कीबोर्ड शॉर्टकट
C software | Software | सॉफ़्टवेयर | computer.ms_office
M windows_os | Windows Operating System Basics | विंडोज़ ऑपरेटिंग सिस्टम की मूल बातें
M ms_word | Microsoft Word | माइक्रोसॉफ़्ट वर्ड
M ms_excel | Microsoft Excel | माइक्रोसॉफ़्ट एक्सेल
M ms_powerpoint | Microsoft PowerPoint | माइक्रोसॉफ़्ट पावरपॉइंट
C internet_email | Working with Internet and E-mails | इंटरनेट और ई-मेल के साथ कार्य | computer.internet_networking
M browsing | Web Browsing and Searching | वेब ब्राउज़िंग और खोज
M download_upload | Downloading and Uploading | डाउनलोड और अपलोड
M email_account | Managing an E-mail Account | ई-मेल खाता प्रबंधन
M e_banking | e-Banking | ई-बैंकिंग
C networking_security | Basics of Networking and Cyber Security | नेटवर्किंग और साइबर सुरक्षा की मूल बातें | computer.security
M devices_protocols | Networking Devices and Protocols | नेटवर्किंग उपकरण और प्रोटोकॉल
M threats | Network and Information Security Threats (Hacking, Virus, Worms, Trojan) | नेटवर्क और सूचना सुरक्षा खतरे (हैकिंग, वायरस, वर्म, ट्रोजन)
M prevention | Preventive Measures | निवारक उपाय
`;

// CGL Tier-II Paper-II Statistics (13.11.6) — JSO / Statistical Investigator posts.
export const SSC_STATISTICS = String.raw`
C data_presentation | Collection, Classification and Presentation of Statistical Data | सांख्यिकीय आँकड़ों का संग्रह, वर्गीकरण और प्रस्तुति | -
C central_tendency | Measures of Central Tendency | केंद्रीय प्रवृत्ति के माप | -
C dispersion | Measures of Dispersion | प्रकीर्णन के माप | -
C moments | Moments, Skewness and Kurtosis | आघूर्ण, विषमता और ककुदता | -
C correlation_regression | Correlation and Regression | सहसंबंध और समाश्रयण | -
C probability_theory | Probability Theory | प्रायिकता सिद्धांत | -
C distributions | Random Variable and Probability Distributions | यादृच्छिक चर और प्रायिकता बंटन | -
C sampling | Sampling Theory | प्रतिचयन सिद्धांत | -
C inference | Statistical Inference | सांख्यिकीय अनुमान | -
C anova | Analysis of Variance | प्रसरण विश्लेषण | -
C time_series | Time Series Analysis | काल श्रेणी विश्लेषण | -
C index_numbers | Index Numbers | सूचकांक | -
`;

// CGL Tier-II Paper-III General Studies (Finance and Economics) (13.11.7) — AAO posts.
export const SSC_FINANCE_ECONOMICS = String.raw`
C accounts | Finance and Accounts | वित्त और लेखा | -
T financial_accounting | Financial Accounting: Nature, Scope, Limitations, Concepts, Conventions, GAAP | वित्तीय लेखांकन: प्रकृति, क्षेत्र, सीमाएँ, अवधारणाएँ, परिपाटियाँ, GAAP
T basic_accounting | Basic Concepts of Accounting | लेखांकन की मूल अवधारणाएँ
M entry_books | Single and Double Entry, Books of Original Entry, Journal, Ledgers | एकल और दोहरी प्रविष्टि, मूल प्रविष्टि की पुस्तकें, रोज़नामचा, खाता बही
M reconciliation | Bank Reconciliation, Trial Balance, Rectification of Errors | बैंक समाधान, तलपट, त्रुटि सुधार
M final_accounts | Manufacturing, Trading, Profit & Loss Appropriation Accounts, Balance Sheet | विनिर्माण, व्यापार, लाभ-हानि विनियोग खाते, तुलन पत्र
M capital_revenue | Capital and Revenue Expenditure | पूँजीगत और राजस्व व्यय
M depreciation_inventory | Depreciation Accounting, Valuation of Inventories | मूल्यह्रास लेखांकन, स्टॉक मूल्यांकन
M non_profit | Non-profit Organisations: Receipts & Payments, Income & Expenditure Accounts | गैर-लाभकारी संगठन: प्राप्ति और भुगतान, आय और व्यय खाते
M bills_ledgers | Bills of Exchange, Self-Balancing Ledgers | विनिमय पत्र, स्व-संतुलित खाता बही
C economics_governance | Economics and Governance | अर्थशास्त्र और शासन | -
T cag | Comptroller & Auditor General of India | भारत के नियंत्रक एवं महालेखा परीक्षक
T finance_commission | Finance Commission | वित्त आयोग
T micro_basics | Basic Concepts of Economics and Micro Economics | अर्थशास्त्र और व्यष्टि अर्थशास्त्र की मूल अवधारणाएँ
T demand_supply | Theory of Demand and Supply | माँग और आपूर्ति का सिद्धांत
T production_cost | Theory of Production and Cost | उत्पादन और लागत का सिद्धांत
T markets | Forms of Market and Price Determination | बाज़ार के रूप और कीमत निर्धारण
T indian_economy | Indian Economy: Sectors, National Income, Population, Poverty and Unemployment, Infrastructure | भारतीय अर्थव्यवस्था: क्षेत्र, राष्ट्रीय आय, जनसंख्या, गरीबी और बेरोज़गारी, अवसंरचना
T reforms | Economic Reforms since 1991 (LPG, Disinvestment) | 1991 से आर्थिक सुधार (उदारीकरण, निजीकरण, वैश्वीकरण, विनिवेश)
T money_banking | Money and Banking: RBI, Monetary/Fiscal Policy, Budget, BoP, FRBM Act 2003 | मुद्रा और बैंकिंग: RBI, मौद्रिक/राजकोषीय नीति, बजट, भुगतान संतुलन, FRBM अधिनियम 2003
T it_governance | Role of Information Technology in Governance | शासन में सूचना प्रौद्योगिकी की भूमिका
`;
