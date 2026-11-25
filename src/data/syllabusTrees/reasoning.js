/**
 * General Intelligence & Reasoning — shared concept library (Railway).
 * Format (see engine.js): C chapter | T topic | S subtopic | M micro-concept
 *   C slug | English | Hindi | legacyTopicId
 *   T/S/M slug | English | Hindi [| fig]
 * `fig` = needs a figure/image → hidden from text-MCQ practice.
 * Exam availability lives in ./exams.js. Ids: rr.<chapter>.<topic>[.<sub>].<micro>
 * NEVER rename a slug; deactivate and add instead.
 */
export const REASONING = String.raw`
C analogy | Analogy | सादृश्यता | reasoning.analogy
T word | Word Analogy | शब्द सादृश्यता
S meaning | Meaning-based | अर्थ आधारित
M synonym | Synonym-based | समानार्थी आधारित
M antonym | Antonym-based | विलोम आधारित
S relation | Relationship-based | संबंध आधारित
M object_function | Object and Function | वस्तु और कार्य
M part_whole | Part and Whole | अंश और पूर्ण
M worker_workplace | Worker and Workplace | कार्यकर्ता और कार्यस्थल
M worker_tool | Worker and Tool | कार्यकर्ता और औज़ार
M cause_effect | Cause and Effect | कारण और प्रभाव
M product_raw | Product and Raw Material | उत्पाद और कच्चा माल
M animal_related | Animal: Young One, Sound, Dwelling | पशु: बच्चा, ध्वनि, निवास
M country_capital | Country, Capital and Currency | देश, राजधानी और मुद्रा
M instrument_measure | Instrument and Measurement | उपकरण और मापन
M degree | Degree / Intensity | मात्रा / तीव्रता
T number | Number Analogy | संख्या सादृश्यता
S arithmetic | Arithmetic Relation | अंकगणितीय संबंध
M addition | Addition-based | योग आधारित
M subtraction | Subtraction-based | व्यवकलन आधारित
M multiplication | Multiplication-based | गुणन आधारित
M division | Division-based | भाग आधारित
S powers | Powers | घात
M square | Square-based | वर्ग आधारित
M cube | Cube-based | घन आधारित
M square_cube_offset | Square/Cube ± n | वर्ग/घन ± n
M square_root | Square-root-based | वर्गमूल आधारित
S property | Number Property | संख्या गुण
M prime | Prime-number-based | अभाज्य संख्या आधारित
M digit_sum | Digit Sum / Digit Product | अंकों का योग / गुणनफल
M factor_multiple | Factor / Multiple | गुणनखंड / गुणज
M mixed_operation | Mixed Operations | मिश्रित संक्रियाएँ
S pairs | Number Pairs and Triplets | संख्या युग्म और त्रिक
M number_pair | Number-pair Analogy | संख्या युग्म सादृश्यता
M number_triplet | Number-triplet Analogy | संख्या त्रिक सादृश्यता
T alphabet | Alphabet Analogy | वर्णमाला सादृश्यता
S position | Letter Position | अक्षर स्थिति
M forward | Forward Position | आगे की स्थिति
M backward | Backward Position | पीछे की स्थिति
M opposite | Opposite Letters (A↔Z) | विपरीत अक्षर (A↔Z)
S pattern | Letter Pattern | अक्षर पैटर्न
M position_difference | Position Difference | स्थिति अंतर
M alternate | Alternate Letters | एकांतर अक्षर
M reversed_group | Reversed Letter Group | उलटा अक्षर समूह
M letter_cluster | Letter-cluster Analogy | अक्षर-समूह सादृश्यता
T letter_number | Letter–Number Analogy | अक्षर–संख्या सादृश्यता
M position_value | Letter Positions as Numbers | अक्षर स्थिति को संख्या के रूप में
T figure | Figure Analogy | आकृति सादृश्यता | fig
M figure_transform | Rotation, Reflection, Element Change | घूर्णन, परावर्तन, तत्व परिवर्तन | fig

C classification | Classification (Odd One Out) | वर्गीकरण (विषम को चुनें) | reasoning.classification
T word | Word Classification | शब्द वर्गीकरण
M category | By Category | श्रेणी के आधार पर
M meaning | By Meaning / Usage | अर्थ / उपयोग के आधार पर
M letters_in_word | By Letters in the Word | शब्द के अक्षरों के आधार पर
T number | Number Classification | संख्या वर्गीकरण
M even_odd | Even / Odd | सम / विषम
M prime_composite | Prime / Composite | अभाज्य / भाज्य
M squares_cubes | Squares / Cubes | वर्ग / घन
M divisibility | Divisibility | विभाज्यता
M digit_sum | Digit Sum | अंकों का योग
M number_pairs | Number Pairs | संख्या युग्म
T letter | Letter-cluster Classification | अक्षर-समूह वर्गीकरण
M position_pattern | Position Pattern | स्थिति पैटर्न
M vowels | Vowel Pattern | स्वर पैटर्न
M gaps | Gaps Between Letters | अक्षरों के बीच अंतर
T gk_based | General-knowledge-based | सामान्य ज्ञान आधारित
M gk_groups | States, Instruments, Rivers and Similar Groups | राज्य, वाद्य, नदियाँ आदि
T figure | Figure Classification | आकृति वर्गीकरण | fig
M figure_odd | Odd Figure Out | विषम आकृति | fig

C number_series | Number Series | संख्या श्रृंखला | reasoning.number_letter_series
T difference | Difference-based Series | अंतर आधारित श्रृंखला
M constant_difference | Constant Difference | स्थिर अंतर
M increasing_difference | Increasing / Decreasing Difference | बढ़ता / घटता अंतर
M second_difference | Second Difference | द्वितीय अंतर
T ratio | Ratio-based Series | अनुपात आधारित श्रृंखला
M multiplication | Multiplication Series | गुणन श्रृंखला
M division | Division Series | भाग श्रृंखला
M multiply_add | ×n ± k Series | ×n ± k श्रृंखला
T powers | Square and Cube Series | वर्ग और घन श्रृंखला
M squares | Square Series | वर्ग श्रृंखला
M cubes | Cube Series | घन श्रृंखला
M power_offset | n² ± n / n³ ± n Series | n² ± n / n³ ± n श्रृंखला
T special | Special Series | विशेष श्रृंखला
M prime | Prime Number Series | अभाज्य संख्या श्रृंखला
M fibonacci | Fibonacci-type Series | फिबोनाची प्रकार श्रृंखला
M triangular | Triangular Number Series | त्रिभुजाकार संख्या श्रृंखला
T alternate | Alternate and Mixed Series | एकांतर और मिश्रित श्रृंखला
M alternate | Alternate (Interleaved) Series | एकांतर श्रृंखला
M mixed_operation | Mixed-operation Series | मिश्रित संक्रिया श्रृंखला
T task | Question Type | प्रश्न प्रकार
M next_term | Next Term | अगला पद
M missing_term | Missing Term | लुप्त पद
M wrong_term | Wrong Term | गलत पद
M multiple_missing | Multiple Missing Terms | एकाधिक लुप्त पद

C alphabet_series | Alphabetical and Letter Series | वर्णमाला और अक्षर श्रृंखला | reasoning.number_letter_series
T letter_series | Letter Series | अक्षर श्रृंखला
M skip | Skip Pattern | छोड़ने का पैटर्न
M reverse | Reverse Pattern | उल्टा पैटर्न
M alternate | Alternate Pattern | एकांतर पैटर्न
T cluster | Letter-cluster Series | अक्षर-समूह श्रृंखला
M cluster_series | Groups of 2–4 Letters | 2–4 अक्षरों के समूह
T repeating | Repeating Series (Fill the Blanks) | दोहराव श्रृंखला (रिक्त स्थान भरें)
M repeating_blanks | Fill the Blanks | रिक्त स्थान भरें
T alpha_numeric | Alpha-numeric-symbol Series | अक्षर-संख्या-प्रतीक श्रृंखला
M element_position | Position-based Questions | स्थिति आधारित प्रश्न
M element_count | Counting Elements by Condition | शर्त के अनुसार गिनती
T position | Alphabet Position Test | वर्णमाला स्थिति परीक्षण
M nth_letter | nth Letter from Left / Right | बाएँ / दाएँ से n-वाँ अक्षर
M letters_between | Letters Between Two Letters | दो अक्षरों के बीच के अक्षर

C coding_decoding | Coding-Decoding | कूटलेखन-कूटवाचन | reasoning.coding_decoding
T letter | Letter Coding | अक्षर कूटलेखन
M forward_shift | Forward Shift | आगे की ओर विस्थापन
M backward_shift | Backward Shift | पीछे की ओर विस्थापन
M variable_shift | Variable Shift | परिवर्तनशील विस्थापन
M opposite | Opposite Letters | विपरीत अक्षर
M reverse_order | Reverse Order | उल्टा क्रम
M replacement | Letter Replacement | अक्षर प्रतिस्थापन
M pair_swap | Pair Swap / Mirror | युग्म अदला-बदली
T number | Number Coding | संख्या कूटलेखन
M letter_positions | Letter Positions | अक्षर स्थितियाँ
M sum_product | Sum / Product of Positions | स्थितियों का योग / गुणनफल
M position_multiple | Position × n | स्थिति × n
T substitution | Substitution Coding | प्रतिस्थापन कूटलेखन
M call_x_y | Call X as Y | X को Y कहा जाए
T sentence | Sentence / Fictitious Language | वाक्य / कृत्रिम भाषा
M common_word | Common-word Method | सामान्य शब्द विधि
T symbol | Symbol and Conditional Coding | प्रतीक और शर्त आधारित कूटलेखन
M symbol_code | Symbol Coding | प्रतीक कूटलेखन
M conditional | Conditional Coding | शर्त आधारित कूटलेखन
T mixed | Mixed Coding | मिश्रित कूटलेखन
M letter_number_mix | Mixed Letter–Number Coding | मिश्रित अक्षर–संख्या कूटलेखन

C math_operations | Mathematical Operations | गणितीय संक्रियाएँ | reasoning.mathematical_operations
T substitution | Symbol Substitution | प्रतीक प्रतिस्थापन
M operator_swap | Operators Replaced by Symbols | संकेतों के स्थान पर प्रतीक
T interchange | Interchange of Signs / Numbers | चिह्नों / संख्याओं का परस्पर परिवर्तन
M make_true | Make the Equation True | समीकरण को सही बनाएँ
T bodmas | BODMAS with Substituted Operators | प्रतिस्थापित संक्रियाओं के साथ BODMAS
M balance | Balancing an Equation | समीकरण संतुलन
T missing_number | Missing Number in a Grid (text) | जाल में लुप्त संख्या (पाठ)
M grid_rule | Row / Column Rule | पंक्ति / स्तंभ नियम

C blood_relations | Blood Relations | रक्त संबंध | reasoning.blood_relations
T direct | Direct Relations | प्रत्यक्ष संबंध
M direct_statement | Relation from Statements | कथनों से संबंध
T puzzle | Family Puzzles | परिवार पहेली
M family_members | Family of n Members | n सदस्यों का परिवार
T coded | Coded Relations | कूटबद्ध संबंध
M symbol_relation | A + B Means … | A + B का अर्थ …
T pointing | Pointing / Introduction | संकेत / परिचय
M photograph | Pointing to a Photograph | तस्वीर की ओर संकेत
T generation | Generation Tree and Gender | पीढ़ी वृक्ष और लिंग
M gender | Gender Identification | लिंग पहचान

C direction_distance | Direction and Distance | दिशा और दूरी | reasoning.direction_sense
T direction | Direction | दिशा
M final_direction | Final Direction after Turns | मोड़ों के बाद अंतिम दिशा
M angle_turns | Turning by Angles | कोणों से मुड़ना
T distance | Distance | दूरी
M shortest_distance | Shortest Distance (Pythagoras) | न्यूनतम दूरी (पाइथागोरस)
M distance_from_start | Distance from Start | आरंभ से दूरी
T shadow | Shadow-based | छाया आधारित
M sun_shadow | Sunrise / Sunset Shadow | सूर्योदय / सूर्यास्त छाया
T coded | Coded Directions | कूटबद्ध दिशाएँ
M point_to_point | Point-to-point Problems | बिंदु से बिंदु प्रश्न

C order_ranking | Order and Ranking | क्रम और रैंकिंग | reasoning.order_ranking
T position | Position | स्थिति
M left_right | Position from Left / Right | बाएँ / दाएँ से स्थिति
M total_count | Total Number of Persons | कुल व्यक्तियों की संख्या
M interchange | Positions after Interchange | अदला-बदली के बाद स्थिति
T comparison | Comparison Ranking | तुलनात्मक रैंकिंग
M taller_heavier | Taller / Heavier / Older | लंबा / भारी / बड़ा
T sequence | Sequence | अनुक्रम
M arrival_order | Order of Arrival | आगमन का क्रम

C syllogism | Syllogism | न्याय निगमन | reasoning.syllogism
T statements | Statements | कथन
M two_statements | Two Statements | दो कथन
M three_statements | Three or More Statements | तीन या अधिक कथन
T cases | Special Cases | विशेष स्थितियाँ
M possibility | Possibility Cases | संभावना स्थितियाँ
M either_or | Either-or / Complementary Pairs | या तो-या / पूरक युग्म
T method | Venn-diagram Method | वेन आरेख विधि
M venn_method | Solving with Venn Diagrams | वेन आरेख से हल

C venn | Venn Diagrams | वेन आरेख | reasoning.venn_diagrams
T representation | Representation | निरूपण
M best_diagram | Which Diagram Represents the Classes (text) | कौन-सा आरेख वर्गों को दर्शाता है (पाठ)
T counting | Counting from Sets | समुच्चय से गिनती
M overlapping_sets | Overlapping Sets (numeric) | अतिव्यापी समुच्चय (संख्यात्मक)

C statements | Statement-based Reasoning | कथन आधारित तर्क | reasoning.statement_conclusion
T conclusion | Statement and Conclusion | कथन और निष्कर्ष
M follows | Which Conclusion Follows | कौन-सा निष्कर्ष निकलता है
T assumption | Statement and Assumption | कथन और पूर्वधारणा
M implicit | Implicit Assumption | निहित पूर्वधारणा
T argument | Statement and Arguments | कथन और तर्क
M strong_weak | Strong / Weak Argument | मज़बूत / कमज़ोर तर्क
T course_action | Statement and Course of Action | कथन और कार्यवाही
M action | Which Course of Action Follows | कौन-सी कार्यवाही उचित है
T cause_effect | Cause and Effect | कारण और प्रभाव
M cause_effect | Identify Cause and Effect | कारण और प्रभाव पहचानें
T inference | Inference | अनुमान
M passage_inference | Passage-based Inference | गद्यांश आधारित अनुमान

C analytical | Analytical Reasoning and Puzzles | विश्लेषणात्मक तर्क और पहेलियाँ | reasoning.seating_arrangement
T seating | Seating Arrangement | बैठक व्यवस्था
M linear | Linear (One / Two Rows) | रैखिक (एक / दो पंक्तियाँ)
M circular | Circular | वृत्ताकार
M square_rect | Square / Rectangular Table | वर्गाकार / आयताकार मेज़
T puzzles | Puzzles | पहेलियाँ
M floor_box | Floor and Box Puzzles | मंज़िल और डिब्बा पहेली
M scheduling | Day / Month Scheduling | दिन / महीना अनुसूची
M multi_attribute | Multi-attribute Puzzles | बहु-गुण पहेलियाँ
M comparison_puzzle | Comparison / Inequality Puzzles | तुलना / असमिका पहेलियाँ

C data_sufficiency | Data Sufficiency | आँकड़ों की पर्याप्तता | reasoning.data_sufficiency
T reasoning_ds | Reasoning-based | तर्क आधारित
M ranking_direction_ds | Ranking, Direction, Blood Relation, Coding | रैंकिंग, दिशा, रक्त संबंध, कूटलेखन
T numeric_ds | Numeric | संख्यात्मक
M age_number_ds | Age, Number and Ratio | आयु, संख्या और अनुपात

C data_interpretation | Data Interpretation (Reasoning) | आँकड़ों का निर्वचन (तर्क) | -
T tables | Tables and Simple Data | सारणी और सरल आँकड़े
M table_reading | Reading and Comparing Data | आँकड़े पढ़ना और तुलना करना

C decision_making | Decision Making | निर्णय लेना | -
T eligibility | Eligibility Criteria | पात्रता मानदंड
M criteria | Decide by Given Criteria | दिए गए मानदंड से निर्णय
T situation | Situation Reaction | स्थिति प्रतिक्रिया
M best_action | Best Course of Action | सर्वोत्तम कार्यवाही

C jumbling | Jumbling | शब्द व्यवस्थापन | -
T words | Word Arrangement | शब्द व्यवस्था
M meaningful_order | Meaningful / Logical Order | सार्थक / तार्किक क्रम
M dictionary_order | Dictionary Order | शब्दकोश क्रम
T letters | Letter Rearrangement | अक्षर पुनर्व्यवस्था
M form_word | Rearrange Letters to Form a Word | अक्षरों से शब्द बनाना
M word_formation | Word Formation from a Given Word | दिए गए शब्द से शब्द बनाना

C similarities | Similarities and Differences | समानताएँ और अंतर | -
T common | Common Property | सामान्य गुण
M common_property | Common Property of a Group | समूह का सामान्य गुण
T differs | Difference | अंतर
M which_differs | Which Differs and Why | कौन अलग है और क्यों

C calendar_clock | Calendar and Clock | कैलेंडर और घड़ी | reasoning.calendar_clock
T calendar | Calendar | कैलेंडर
M day_of_date | Day for a Date | तारीख का दिन
M odd_days | Odd Days | विषम दिन
M repeating_calendar | Repeating Calendars | दोहराने वाले कैलेंडर
T clock | Clock | घड़ी
M hand_angle | Angle Between Hands | सुइयों के बीच का कोण
M coinciding | Coinciding Hands | सुइयों का मिलना
M mirror_time | Mirror Time (text) | दर्पण समय (पाठ)

C maps_graphs | Maps and Graph Interpretation | मानचित्र और आलेख निर्वचन | -
T maps | Maps (described in text) | मानचित्र (पाठ में वर्णित)
M route_map | Route and Direction Maps | मार्ग और दिशा मानचित्र
T graphs | Graph Interpretation (numeric) | आलेख निर्वचन (संख्यात्मक)
M simple_graph | Simple Graph / Table Data | सरल आलेख / सारणी आँकड़े

C non_verbal | Non-verbal Reasoning | अशाब्दिक तर्क | reasoning.non_verbal
T mirror | Mirror and Water Images (letters, numbers) | दर्पण और जल प्रतिबिंब (अक्षर, संख्या)
M text_mirror | Mirror Image of Words / Numbers | शब्दों / संख्याओं का दर्पण प्रतिबिंब
M figure_mirror | Mirror Image of Figures | आकृतियों का दर्पण प्रतिबिंब | fig
T dice | Dice and Cube (text) | पासा और घन (पाठ)
M dice_text | Opposite Faces from Positions | स्थितियों से विपरीत फलक
T figures | Figure-based | आकृति आधारित | fig
M paper_folding | Paper Folding / Cutting | कागज़ मोड़ना / काटना | fig
M embedded | Embedded Figures | अंतर्निहित आकृतियाँ | fig
M counting_figures | Counting Figures | आकृतियों की गिनती | fig
`;
