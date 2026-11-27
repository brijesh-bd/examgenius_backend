/**
 * Banking concept libraries (IBPS / SBI). Format: see engine.js.
 *   C slug | English | Hindi | legacyTopicId|- [| fig]
 *   T/S/M slug | English | Hindi [| patterns]
 * Each library is written ONCE and shared by every banking exam; which
 * chapters an exam (and stage) gets is decided only in ./bankExams.js.
 * IBPS/SBI notifications name sections only, so every chapter below is
 * 'supplementary' (recommended coverage) unless bankExams.js marks it
 * official from a retrieved notification.
 * Patterns: question categories used by AI generation (children inherit).
 */

// ── Quantitative Aptitude / Numerical Ability (prefix bq) ───────────────────
export const BANK_QUANT = String.raw`
C simplification | Simplification | सरलीकरण | quant.simplification
T bodmas | BODMAS and Order of Operations | BODMAS और संक्रियाओं का क्रम | find the value; missing number
M brackets | Brackets and Operators | कोष्ठक और संक्रियाएँ
M fractions_decimals | Fractions and Decimals | भिन्न और दशमलव
T powers_roots | Powers, Squares, Cubes and Roots | घात, वर्ग, घन और मूल
M square_roots | Square and Cube Roots | वर्गमूल और घनमूल
M indices | Laws of Indices | घातांक के नियम
T percentage_based | Percentage- and Fraction-based Simplification | प्रतिशत और भिन्न आधारित सरलीकरण
M percent_of | Percent of a Number | किसी संख्या का प्रतिशत

C approximation | Approximation | सन्निकटन | quant.simplification
T rounding | Rounding and Nearest Value | पूर्णांकन और निकटतम मान | approximate value
M decimal_rounding | Decimal Rounding | दशमलव पूर्णांकन
M root_approx | Approximate Square Roots | अनुमानित वर्गमूल
M percent_approx | Approximate Percentages | अनुमानित प्रतिशत

C number_series | Number Series | संख्या श्रृंखला | quant.number_series
T missing_series | Missing Number Series | लुप्त संख्या श्रृंखला | find the missing term
S difference_based | Difference-based | अंतर आधारित
M first_difference | First Difference | प्रथम अंतर
M second_difference | Second / Third Difference | द्वितीय / तृतीय अंतर
S multiplication_based | Multiplication / Division-based | गुणा / भाग आधारित
M mixed_operation | ×n ± k Pattern | ×n ± k पैटर्न
S power_based | Squares, Cubes and Primes | वर्ग, घन और अभाज्य
M square_cube_series | Square / Cube ± n | वर्ग / घन ± n
M prime_series | Prime Number Series | अभाज्य संख्या श्रृंखला
S alternate | Alternate and Two-series | एकांतर और दो-श्रृंखला
M alternate_series | Alternate Series | एकांतर श्रृंखला
T wrong_series | Wrong Number Series | गलत संख्या श्रृंखला | find the wrong term
M wrong_term | Find the Wrong Term | गलत पद ज्ञात करें
T new_pattern | New-pattern Series | नए पैटर्न की श्रृंखला | missing term in a statement-based series
M statement_series | Series with Statements / Two Rows | कथन / दो पंक्तियों वाली श्रृंखला

C quadratic_equations | Quadratic Equations | द्विघात समीकरण | quant.quadratic_equations
T roots | Finding Roots | मूल ज्ञात करना | compare x and y
M factorisation | Factorisation Method | गुणनखंड विधि
M sign_method | Sign Method (Shortcut) | चिह्न विधि (शॉर्टकट)
T comparison | Comparison of Roots (x vs y) | मूलों की तुलना (x बनाम y)
M linear_vs_quadratic | Linear and Square-root Equations | रैखिक और वर्गमूल समीकरण
M relation_cases | x > y, x < y, x = y or no relation | x > y, x < y, x = y या कोई संबंध नहीं

C percentage | Percentage | प्रतिशत | quant.percentage
T basics | Percentage Basics | प्रतिशत की मूल बातें | word problem
M fraction_percent | Fraction–Percentage Conversion | भिन्न–प्रतिशत रूपांतरण
M percent_change | Percentage Increase / Decrease | प्रतिशत वृद्धि / कमी
T applications | Applications | अनुप्रयोग
M successive | Successive Percentage Change | क्रमिक प्रतिशत परिवर्तन
M population | Population and Depreciation | जनसंख्या और मूल्यह्रास
M expenditure | Price–Consumption–Expenditure | मूल्य–उपभोग–व्यय
M elections_exams | Elections, Marks and Income | चुनाव, अंक और आय

C ratio_proportion | Ratio and Proportion | अनुपात और समानुपात | quant.ratio_proportion
T ratio | Ratio | अनुपात | word problem
M compound_ratio | Compound and Duplicate Ratio | मिश्र और द्विगुण अनुपात
M ratio_change | Change in Ratio | अनुपात में परिवर्तन
T proportion | Proportion and Variation | समानुपात और विचरण
M mean_third | Mean, Third and Fourth Proportional | माध्य, तृतीय और चतुर्थ समानुपाती
M direct_inverse | Direct and Inverse Variation | प्रत्यक्ष और प्रतिलोम विचरण
T coins_salary | Coins, Salaries and Distribution | सिक्के, वेतन और वितरण
M distribution | Distribution in a Ratio | अनुपात में वितरण

C average | Average | औसत | quant.average
T simple_average | Simple Average | साधारण औसत | word problem
M replacement | Replacement and Inclusion | प्रतिस्थापन और समावेश
M consecutive | Consecutive Numbers | क्रमागत संख्याएँ
T weighted_average | Weighted Average | भारित औसत
M group_average | Combined Group Average | संयुक्त समूह औसत
M cricket_marks | Runs, Marks and Age Averages | रन, अंक और आयु औसत

C profit_loss | Profit and Loss | लाभ और हानि | quant.profit_loss
T cp_sp | Cost Price and Selling Price | क्रय मूल्य और विक्रय मूल्य | word problem
M profit_percent | Profit / Loss Percentage | लाभ / हानि प्रतिशत
M same_sp | Two Articles at the Same SP | समान विक्रय मूल्य पर दो वस्तुएँ
T discount | Marked Price and Discount | अंकित मूल्य और छूट
M successive_discount | Successive Discounts | क्रमिक छूट
M dishonest | Dishonest Dealer / False Weights | बेईमान विक्रेता / गलत बाट

C interest | Simple and Compound Interest | साधारण और चक्रवृद्धि ब्याज | quant.simple_compound_interest
T simple_interest | Simple Interest | साधारण ब्याज | find interest; find rate or time
M si_basic | SI Formula and Rate / Time | साधारण ब्याज सूत्र और दर / समय
T compound_interest | Compound Interest | चक्रवृद्धि ब्याज
M ci_annual | Annual, Half-yearly and Quarterly Compounding | वार्षिक, अर्धवार्षिक और त्रैमासिक चक्रवृद्धि
M ci_si_difference | Difference between CI and SI | चक्रवृद्धि और साधारण ब्याज का अंतर
M instalments | Instalments | किश्तें
M growth_depreciation | Growth and Depreciation | वृद्धि और मूल्यह्रास

C partnership | Partnership | साझेदारी | quant.partnership
T profit_share | Profit Sharing | लाभ का बँटवारा | word problem
M simple_partnership | Simple Partnership | साधारण साझेदारी
M compound_partnership | Capital for Different Periods | भिन्न अवधियों की पूँजी
M working_partner | Working and Sleeping Partner | सक्रिय और निष्क्रिय साझेदार

C mixtures_alligation | Mixture and Alligation | मिश्रण और एलीगेशन | quant.mixtures_alligation
T alligation | Rule of Alligation | एलीगेशन नियम | word problem
M mean_price | Mean Price of a Mixture | मिश्रण का माध्य मूल्य
M ratio_mixing | Ratio of Mixing | मिलाने का अनुपात
T replacement | Repeated Replacement | बार-बार प्रतिस्थापन
M removal_replacement | Removal and Replacement of Liquid | द्रव का निष्कासन और प्रतिस्थापन

C time_work | Time and Work | समय और कार्य | quant.time_work
T work_efficiency | Work and Efficiency | कार्य और दक्षता | word problem
M lcm_method | LCM (Total Work) Method | LCM (कुल कार्य) विधि
M alternate_days | Alternate Days and Leaving Midway | एकांतर दिन और बीच में छोड़ना
M men_women_children | Men, Women and Children | पुरुष, महिलाएँ और बच्चे
M wages | Work and Wages | कार्य और मजदूरी

C pipes_cisterns | Pipes and Cisterns | नल और टंकी | quant.pipes_cisterns
T inlet_outlet | Inlet and Outlet Pipes | भरने और खाली करने वाले नल | word problem
M leak | Leaks | रिसाव
M alternate_opening | Alternate Opening | बारी-बारी से खोलना

C time_speed_distance | Time, Speed and Distance | समय, चाल और दूरी | quant.time_speed_distance
T speed_basics | Speed Basics | चाल की मूल बातें | word problem
M average_speed | Average Speed | औसत चाल
M relative_speed | Relative Speed | सापेक्ष चाल
T trains | Problems on Trains | रेलगाड़ी पर प्रश्न
M train_platform | Crossing a Pole / Platform / Train | खंभा / प्लेटफॉर्म / रेलगाड़ी पार करना
T boats_streams | Boats and Streams | नाव और धारा
M upstream_downstream | Upstream and Downstream | धारा के विपरीत और अनुकूल
T races | Races and Circular Tracks | दौड़ और वृत्ताकार पथ
M head_start | Head Start and Meeting Point | आगे से शुरुआत और मिलने का बिंदु

C ages | Problems on Ages | आयु संबंधी प्रश्न | quant.ages
T age_ratio | Ages with Ratios | अनुपात सहित आयु | word problem
M present_past_future | Present, Past and Future Ages | वर्तमान, भूत और भविष्य आयु

C mensuration | Mensuration | क्षेत्रमिति | quant.mensuration
T two_d | 2D Figures | 2D आकृतियाँ | find area or perimeter
M rectangle_square | Rectangle, Square and Path | आयत, वर्ग और पथ
M triangle | Triangle | त्रिभुज
M circle | Circle and Sector | वृत्त और त्रिज्यखंड
T three_d | 3D Solids | 3D ठोस | find volume or surface area
M cuboid_cube | Cuboid and Cube | घनाभ और घन
M cylinder_cone_sphere | Cylinder, Cone and Sphere | बेलन, शंकु और गोला

C probability | Probability | प्रायिकता | quant.probability
T basic_probability | Basic Probability | मूल प्रायिकता | find the probability
M coins_dice | Coins and Dice | सिक्के और पासे
M cards | Playing Cards | ताश के पत्ते
M balls_bags | Balls from Bags | थैलों से गेंदें

C permutation_combination | Permutation and Combination | क्रमचय और संचय | quant.permutation_combination
T arrangements | Permutation (Arrangements) | क्रमचय (व्यवस्था) | number of ways
M word_arrangement | Arranging Letters of a Word | शब्द के अक्षरों की व्यवस्था
M circular_permutation | Circular Arrangements | वृत्ताकार व्यवस्था
T selections | Combination (Selections) | संचय (चयन)
M committee | Committees and Groups | समितियाँ और समूह

C data_interpretation | Data Interpretation | आँकड़ा व्याख्या | quant.data_interpretation
T di_types | DI Types | DI के प्रकार | calculation from data; percentage and ratio from data
M table_di | Table DI | तालिका DI
M bar_di | Bar Graph DI | बार ग्राफ DI
M line_di | Line Graph DI | रेखा ग्राफ DI
M pie_di | Pie Chart DI | पाई चार्ट DI
M mixed_di | Mixed / Combined DI | मिश्रित / संयुक्त DI
M caselet_di | Caselet (Paragraph) DI | केसलेट (अनुच्छेद) DI
M missing_di | Missing-data DI | लुप्त आँकड़ा DI
T arithmetic_di | Arithmetic-based DI | अंकगणित आधारित DI
M arithmetic_di_sets | Profit, Speed and Work Data Sets | लाभ, चाल और कार्य आँकड़े

C data_sufficiency | Data Sufficiency | आँकड़ा पर्याप्तता | quant.data_sufficiency
T two_statement | Two-statement DS | दो-कथन DS | is the data sufficient
M ds_arithmetic | Arithmetic DS | अंकगणित DS
T three_statement | Three-statement DS | तीन-कथन DS
M ds_which_redundant | Which Statement is Not Necessary | कौन-सा कथन आवश्यक नहीं

C quantity_comparison | Quantity Comparison | मात्रा तुलना | -
T compare | Quantity I vs Quantity II | मात्रा I बनाम मात्रा II | compare two quantities
M arithmetic_quantities | Arithmetic-based Quantities | अंकगणित आधारित मात्राएँ
M equation_quantities | Equation-based Quantities | समीकरण आधारित मात्राएँ

C number_system | Number System | संख्या पद्धति | -
T divisibility | Divisibility and Remainders | विभाज्यता और शेषफल | find the number
M hcf_lcm | HCF and LCM | महत्तम और लघुत्तम समापवर्त्य
M unit_digit | Unit Digit | इकाई अंक
`;

// ── Reasoning Ability (prefix br) ───────────────────────────────────────────
export const BANK_REASONING = String.raw`
C inequality | Inequality | असमानता | reasoning.inequality
T direct | Direct Inequality | प्रत्यक्ष असमानता | which conclusion follows
M direct_chain | Chained Statements | श्रृंखलाबद्ध कथन
M either_or | Either–Or Cases | या तो–या स्थिति
T coded | Coded Inequality | कूटबद्ध असमानता
M symbol_decoding | Decoding Symbols | प्रतीकों का कूटवाचन
T reverse | Reverse and Input-based Inequality | उलटी और इनपुट आधारित असमानता
M fill_sign | Fill the Sign | चिह्न भरें

C syllogism | Syllogism | न्याय निगमन | reasoning.syllogism
T basic | Statements and Conclusions | कथन और निष्कर्ष | which conclusion follows
M all_some_no | All / Some / No | सभी / कुछ / कोई नहीं
M possibility | Possibility Cases | संभावना की स्थितियाँ
T only_few | Only a Few / Only | केवल कुछ / केवल
M only_few_cases | Only a Few Cases | केवल कुछ की स्थितियाँ
T reverse_syllogism | Reverse Syllogism | उलटा न्याय निगमन
M find_statements | Find the Statements | कथन ज्ञात करें

C coding_decoding | Coding-Decoding | कूटलेखन-कूटवाचन | reasoning.coding_decoding
T letter_coding | Letter Coding | अक्षर कूटलेखन | find the code
M shift_coding | Letter Shift Coding | अक्षर विस्थापन कूटलेखन
M reverse_coding | Reverse / Opposite Coding | उलटा / विपरीत कूटलेखन
T sentence_coding | Word / Sentence Coding | शब्द / वाक्य कूटलेखन
M chinese_coding | Sentence (Chinese) Coding | वाक्य (चीनी) कूटलेखन
T new_coding | New-pattern Coding | नए पैटर्न का कूटलेखन
M number_symbol | Number and Symbol Coding | संख्या और प्रतीक कूटलेखन

C blood_relations | Blood Relations | रक्त संबंध | reasoning.blood_relations
T family_tree | Family Tree | पारिवारिक वृक्ष | how is X related to Y
M direct_relation | Direct Relations | प्रत्यक्ष संबंध
M coded_relation | Coded Relations | कूटबद्ध संबंध
M puzzle_relation | Family-based Puzzles | परिवार आधारित पहेलियाँ

C direction_sense | Direction and Distance | दिशा और दूरी | reasoning.direction_sense
T distance | Direction and Shortest Distance | दिशा और न्यूनतम दूरी | find direction or distance
M pythagoras | Shortest Distance (Pythagoras) | न्यूनतम दूरी (पाइथागोरस)
M point_based | Point-based Direction | बिंदु आधारित दिशा
M shadow | Shadow-based Direction | छाया आधारित दिशा

C order_ranking | Order and Ranking | क्रम और रैंकिंग | reasoning.order_ranking
T position | Position in a Row | पंक्ति में स्थान | find the position
M total_persons | Total Number of Persons | कुल व्यक्ति
M comparison_ranking | Height / Weight Comparison | ऊँचाई / भार तुलना

C alphanumeric_series | Alphanumeric Series | अक्षरांकीय श्रृंखला | reasoning.alphanumeric_series
T element_series | Letter–Number–Symbol Series | अक्षर–संख्या–प्रतीक श्रृंखला | count or position of elements
M preceded_followed | Immediately Preceded / Followed | तुरंत पहले / बाद में
M word_formation | Letter Word Formation | अक्षरों से शब्द निर्माण

C seating_arrangement | Seating Arrangement | बैठक व्यवस्था | reasoning.seating_arrangement
T linear | Linear Arrangement | रैखिक व्यवस्था | arrangement set (3–5 questions)
M single_row | Single Row (North / South) | एक पंक्ति (उत्तर / दक्षिण)
M double_row | Double Row Facing | आमने-सामने दो पंक्तियाँ
M unknown_persons | Unknown Number of Persons | व्यक्तियों की अज्ञात संख्या
T circular | Circular Arrangement | वृत्ताकार व्यवस्था
M facing_centre | Facing the Centre / Outside | केंद्र / बाहर की ओर मुख
M mixed_facing | Mixed Facing | मिश्रित मुख
T polygon | Square / Rectangular / Polygon Table | वर्गाकार / आयताकार / बहुभुज मेज़
M corner_side | Corners and Middles of Sides | कोने और भुजाओं के मध्य

C puzzles | Puzzles | पहेलियाँ | reasoning.puzzles
T floor | Floor and Flat Puzzles | मंज़िल और फ्लैट पहेलियाँ | puzzle set (3–5 questions)
M floor_based | Floor-based | मंज़िल आधारित
M floor_flat | Floor + Flat | मंज़िल + फ्लैट
T box | Box Puzzles | बॉक्स पहेलियाँ
M stacked_boxes | Stacked Boxes | एक के ऊपर एक बॉक्स
T scheduling | Scheduling Puzzles | समय-सारणी पहेलियाँ
M day_month | Day / Month / Year | दिन / माह / वर्ष
M date_based | Date-based | तारीख आधारित
T categorised | Categorised and Comparison Puzzles | वर्गीकृत और तुलना पहेलियाँ
M parameters | Multiple Parameters | अनेक मानदंड
M comparison_puzzle | Comparison-based | तुलना आधारित

C input_output | Input-Output | इनपुट-आउटपुट | reasoning.input_output
T machine | Machine Input | मशीन इनपुट | find the step
M shifting | Word / Number Shifting | शब्द / संख्या विस्थापन
M arithmetic_io | Arithmetic Operations on Numbers | संख्याओं पर अंकगणितीय संक्रियाएँ

C data_sufficiency | Data Sufficiency | आँकड़ा पर्याप्तता | reasoning.data_sufficiency
T ds_reasoning | Reasoning DS | तर्क DS | is the data sufficient
M ds_arrangement | Arrangement / Blood Relation / Direction DS | व्यवस्था / रक्त संबंध / दिशा DS

C logical_reasoning | Logical (Verbal) Reasoning | तार्किक (शाब्दिक) तर्क | reasoning.statement_conclusion
T statement_based | Statement-based | कथन आधारित | which follows
M assumption | Statement and Assumption | कथन और पूर्वधारणा
M conclusion | Statement and Conclusion | कथन और निष्कर्ष
M course_action | Course of Action | कार्यवाही
M argument | Strong and Weak Arguments | मजबूत और कमजोर तर्क
T critical | Critical Reasoning | आलोचनात्मक तर्क
M strengthen_weaken | Strengthen / Weaken | मजबूत / कमजोर करना
M inference | Inference | अनुमान
M cause_effect | Cause and Effect | कारण और प्रभाव

C miscellaneous | Miscellaneous | विविध | -
T odd_pair | Odd Pair and Meaningful Words | असंगत युग्म और सार्थक शब्द | find the answer
M meaningful_words | Meaningful Word Formation | सार्थक शब्द निर्माण
M number_based | Number-based (Digits) | संख्या आधारित (अंक)
`;

// ── Hindi Language (prefix hl) — RRB Office Assistant / Officer Scale-I ─────
export const BANK_HINDI = String.raw`
C shabd_vichar | Word Classes (Shabd Vichar) | शब्द विचार | -
T sangya | Noun | संज्ञा | identify; correct form
M sangya_bhed | Types of Noun | संज्ञा के भेद
T sarvanam | Pronoun | सर्वनाम
M sarvanam_bhed | Types of Pronoun | सर्वनाम के भेद
T visheshan | Adjective | विशेषण
M visheshan_bhed | Types of Adjective | विशेषण के भेद
T kriya | Verb | क्रिया
M kriya_bhed | Types of Verb | क्रिया के भेद
T ling_vachan | Gender and Number | लिंग और वचन
M ling | Gender | लिंग
M vachan | Number | वचन
T kaal | Tense | काल

C shabd_rachna | Word Formation | शब्द रचना | -
T sandhi | Sandhi | संधि | sandhi-vichhed; identify the type
M swar_sandhi | Vowel Sandhi | स्वर संधि
M vyanjan_sandhi | Consonant Sandhi | व्यंजन संधि
M visarg_sandhi | Visarga Sandhi | विसर्ग संधि
T samas | Compounds | समास
M samas_bhed | Types of Samas | समास के भेद
T upsarg | Prefixes | उपसर्ग
T pratyay | Suffixes | प्रत्यय

C shabd_bhandar | Vocabulary | शब्द भंडार | -
T paryayvachi | Synonyms | पर्यायवाची | choose the correct word
T vilom | Antonyms | विलोम
T anek_shabd | One Word Substitution | अनेक शब्दों के लिए एक शब्द
T muhavare | Idioms | मुहावरे
T lokoktiyan | Proverbs | लोकोक्तियाँ

C vakya | Sentence | वाक्य | -
T vakya_shuddhi | Sentence Correction | वाक्य शुद्धि | find the error
M ashuddhi | Error Detection | अशुद्धि पहचान
T vakya_kram | Sentence Rearrangement | वाक्य क्रम व्यवस्था
T riktsthan | Fill in the Blanks | रिक्त स्थान पूर्ति

C gadyansh | Comprehension | गद्यांश | -
T apathit | Unseen Passage | अपठित गद्यांश | questions on the passage
M cloze_hindi | Cloze Test (Hindi) | क्लोज़ टेस्ट (हिंदी)
`;

// ── Banking & Financial Awareness (prefix ba) ───────────────────────────────
export const BANK_AWARENESS = String.raw`
C banking_history | Banking History and Structure | बैंकिंग इतिहास और संरचना | banking_awareness.banking_terms
T history | History of Indian Banking | भारतीय बैंकिंग का इतिहास | fact-based
M nationalisation | Nationalisation (1969, 1980) | राष्ट्रीयकरण (1969, 1980)
M mergers | Bank Mergers and Consolidation | बैंक विलय और समेकन
T structure | Structure of Banks | बैंकों की संरचना
M commercial_banks | Scheduled Commercial Banks (PSB, Private, Foreign) | अनुसूचित वाणिज्यिक बैंक (सरकारी, निजी, विदेशी)
M rrbs | Regional Rural Banks | क्षेत्रीय ग्रामीण बैंक
M cooperative_banks | Cooperative Banks | सहकारी बैंक
M payments_small_finance | Payments Banks and Small Finance Banks | भुगतान बैंक और लघु वित्त बैंक

C rbi | Reserve Bank of India | भारतीय रिज़र्व बैंक | banking_awareness.rbi_monetary_policy
T rbi_basics | RBI — Establishment and Functions | आरबीआई — स्थापना और कार्य | fact-based; concept-based
M rbi_functions | Functions of the RBI | आरबीआई के कार्य
M rbi_governors | Governors and Leadership | गवर्नर और नेतृत्व
T monetary_policy | Monetary Policy | मौद्रिक नीति
M mpc | Monetary Policy Committee | मौद्रिक नीति समिति
M policy_rates | Repo, Reverse Repo, SDF, MSF, Bank Rate | रेपो, रिवर्स रेपो, एसडीएफ, एमएसएफ, बैंक दर
M reserve_ratios | CRR and SLR | सीआरआर और एसएलआर
M omo | Open Market Operations and LAF | खुले बाज़ार की क्रियाएँ और एलएएफ
M inflation_targeting | Inflation Targeting | मुद्रास्फीति लक्ष्यीकरण

C regulation | Banking Regulation | बैंकिंग विनियमन | banking_awareness.acts_regulations
T acts | Banking Acts | बैंकिंग अधिनियम | fact-based
M br_act | Banking Regulation Act, 1949 | बैंकिंग विनियमन अधिनियम, 1949
M rbi_act | RBI Act, 1934 | आरबीआई अधिनियम, 1934
M ni_act | Negotiable Instruments Act, 1881 | परक्राम्य लिखत अधिनियम, 1881
M sarfaesi | SARFAESI Act and IBC | सरफेसी अधिनियम और दिवाला संहिता
T prudential | Prudential Norms | विवेकपूर्ण मानदंड
M basel | Basel I, II and III Norms | बेसल I, II और III मानदंड
M crar | Capital Adequacy (CRAR) | पूँजी पर्याप्तता (सीआरएआर)
M npa | NPA Classification and Provisioning | एनपीए वर्गीकरण और प्रावधान
M pca | Prompt Corrective Action | त्वरित सुधारात्मक कार्रवाई
T compliance | KYC and AML | केवाईसी और एएमएल
M kyc | Know Your Customer | अपने ग्राहक को जानें
M aml | Anti-Money Laundering and PMLA | धन-शोधन निवारण और पीएमएलए
T customer_protection | Customer Protection | ग्राहक संरक्षण
M ombudsman | RBI Integrated Ombudsman Scheme | आरबीआई एकीकृत लोकपाल योजना
M dicgc | Deposit Insurance (DICGC) | जमा बीमा (डीआईसीजीसी)

C products_services | Banking Products and Services | बैंकिंग उत्पाद और सेवाएँ | banking_awareness.banking_terms
T deposits | Deposit Accounts | जमा खाते | concept-based
M casa | Savings and Current Accounts | बचत और चालू खाते
M term_deposits | Fixed and Recurring Deposits | सावधि और आवर्ती जमा
T loans | Loans and Advances | ऋण और अग्रिम
M loan_types | Retail, MSME and Agricultural Loans | खुदरा, एमएसएमई और कृषि ऋण
M psl | Priority Sector Lending | प्राथमिकता क्षेत्र ऋण
M mclr_ebr | MCLR and External Benchmark Rates | एमसीएलआर और बाहरी बेंचमार्क दरें
T instruments | Banking Instruments | बैंकिंग लिखत
M cheques | Cheques, Drafts and CTS | चेक, ड्राफ्ट और सीटीएस
M terms | Common Banking Terms | सामान्य बैंकिंग शब्दावली
T inclusion | Financial Inclusion | वित्तीय समावेशन
M jan_dhan | PMJDY and Inclusion Schemes | पीएमजेडीवाई और समावेशन योजनाएँ
M business_correspondents | Business Correspondents | व्यवसाय प्रतिनिधि

C payment_systems | Payment Systems | भुगतान प्रणालियाँ | -
T systems | Electronic Payment Systems | इलेक्ट्रॉनिक भुगतान प्रणालियाँ | concept-based; fact-based
M neft_rtgs | NEFT and RTGS | एनईएफटी और आरटीजीएस
M imps_upi | IMPS and UPI | आईएमपीएस और यूपीआई
M npci | NPCI and its Products (RuPay, NACH, AePS, BBPS) | एनपीसीआई और उसके उत्पाद
M cbdc | e-Rupee (CBDC) | ई-रुपया (सीबीडीसी)

C financial_system | Indian Financial System | भारतीय वित्तीय प्रणाली | banking_awareness.financial_awareness
T markets | Financial Markets | वित्तीय बाज़ार | concept-based
M money_market | Money Market Instruments (T-bills, CP, CD, Call Money) | मुद्रा बाज़ार लिखत
M capital_market | Capital Market (Primary, Secondary, IPO) | पूँजी बाज़ार (प्राथमिक, द्वितीयक, आईपीओ)
M gsec | Government Securities and Bonds | सरकारी प्रतिभूतियाँ और बॉन्ड
M mutual_funds | Mutual Funds | म्यूचुअल फंड
T regulators | Regulators and Institutions | नियामक और संस्थाएँ
M sebi | SEBI | सेबी
M irdai_pfrda | IRDAI and PFRDA | आईआरडीएआई और पीएफआरडीए
M dfis | NABARD, SIDBI, EXIM Bank, NHB | नाबार्ड, सिडबी, एक्ज़िम बैंक, एनएचबी
M international | IMF, World Bank, ADB, AIIB, NDB | आईएमएफ, विश्व बैंक, एडीबी, एआईआईबी, एनडीबी
T insurance_pension | Insurance and Pension | बीमा और पेंशन
M insurance | Life and General Insurance | जीवन और सामान्य बीमा
M pension | NPS and APY | एनपीएस और एपीवाई

C public_finance | Budget and Economic Survey | बजट और आर्थिक सर्वेक्षण | -
T budget | Union Budget | केंद्रीय बजट | fact-based
M deficits | Fiscal, Revenue and Primary Deficit | राजकोषीय, राजस्व और प्राथमिक घाटा
M taxation | Direct Taxes and GST | प्रत्यक्ष कर और जीएसटी
T survey | Economic Survey | आर्थिक सर्वेक्षण
M indicators | Key Economic Indicators | प्रमुख आर्थिक संकेतक

C government_schemes | Government Schemes | सरकारी योजनाएँ | banking_awareness.government_schemes
T schemes | Financial and Social Schemes | वित्तीय और सामाजिक योजनाएँ | fact-based
M credit_schemes | MUDRA, Stand-Up India, PM SVANidhi | मुद्रा, स्टैंड-अप इंडिया, पीएम स्वनिधि
M insurance_schemes | PMJJBY and PMSBY | पीएमजेजेबीवाई और पीएमएसबीवाई
`;

// ── Computer Knowledge / Computer Aptitude (prefix bc) ──────────────────────
export const BANK_COMPUTER = String.raw`
C fundamentals | Computer Fundamentals | कंप्यूटर की मूल बातें | computer.fundamentals
T history | History and Generations | इतिहास और पीढ़ियाँ | fact-based
M generations | Generations of Computers | कंप्यूटर की पीढ़ियाँ
M types | Types of Computers | कंप्यूटर के प्रकार
T hardware | Hardware | हार्डवेयर
M cpu | CPU, ALU and Control Unit | सीपीयू, एएलयू और नियंत्रण इकाई
M io_devices | Input and Output Devices | इनपुट और आउटपुट डिवाइस
T memory | Memory and Storage | मेमोरी और भंडारण
M primary_memory | RAM, ROM and Cache | रैम, रोम और कैश
M secondary_storage | Secondary Storage | द्वितीयक भंडारण
M units | Memory Units | मेमोरी इकाइयाँ
T number_system | Number System | संख्या पद्धति | conversion
M conversions | Binary, Octal, Decimal, Hexadecimal | द्विआधारी, अष्टाधारी, दशमलव, षोडशाधारी

C software | Software and Operating Systems | सॉफ़्टवेयर और ऑपरेटिंग सिस्टम | computer.operating_system
T software_types | Types of Software | सॉफ़्टवेयर के प्रकार | concept-based
M system_application | System and Application Software | सिस्टम और एप्लिकेशन सॉफ़्टवेयर
M languages | Programming Languages and Translators | प्रोग्रामिंग भाषाएँ और अनुवादक
T os | Operating Systems | ऑपरेटिंग सिस्टम
M os_functions | Functions and Types of OS | ओएस के कार्य और प्रकार
M windows_linux | Windows and Linux Basics | विंडोज़ और लिनक्स की मूल बातें

C ms_office | MS Office | एमएस ऑफ़िस | computer.ms_office
T word | MS Word | एमएस वर्ड | shortcut keys; feature-based
T excel | MS Excel | एमएस एक्सेल
M formulas | Formulas and Functions | सूत्र और फ़ंक्शन
T powerpoint | MS PowerPoint | एमएस पावरपॉइंट
T shortcuts | Keyboard Shortcuts | कीबोर्ड शॉर्टकट

C dbms | Database Basics | डेटाबेस की मूल बातें | -
T db_concepts | DBMS Concepts | डीबीएमएस अवधारणाएँ | concept-based
M keys | Keys and Relations | कुंजियाँ और संबंध
M sql_basics | Basic SQL | मूल एसक्यूएल

C networking | Networking and Internet | नेटवर्किंग और इंटरनेट | computer.internet_networking
T network_basics | Network Basics | नेटवर्क की मूल बातें | concept-based
M lan_wan | LAN, MAN and WAN | लैन, मैन और वैन
M topology | Topologies | टोपोलॉजी
M devices | Hub, Switch, Router, Modem | हब, स्विच, राउटर, मॉडेम
M osi | OSI and TCP/IP Models | ओएसआई और टीसीपी/आईपी मॉडल
T internet | Internet | इंटरनेट
M protocols | HTTP, FTP, SMTP, DNS | एचटीटीपी, एफ़टीपी, एसएमटीपी, डीएनएस
M web_email | Web Browsers and E-mail | वेब ब्राउज़र और ई-मेल

C security | Cyber Security | साइबर सुरक्षा | computer.security
T threats | Threats | ख़तरे | concept-based
M malware | Virus, Worm, Trojan, Ransomware | वायरस, वर्म, ट्रोजन, रैंसमवेयर
M phishing | Phishing, Vishing and Social Engineering | फ़िशिंग, विशिंग और सोशल इंजीनियरिंग
T protection | Protection | सुरक्षा उपाय
M firewall_antivirus | Firewall and Antivirus | फ़ायरवॉल और एंटीवायरस
M encryption_basics | Encryption and Digital Signatures | एन्क्रिप्शन और डिजिटल हस्ताक्षर

C digital_banking | Digital Banking Technology | डिजिटल बैंकिंग प्रौद्योगिकी | -
T channels | Digital Channels | डिजिटल चैनल | concept-based
M internet_mobile_banking | Internet and Mobile Banking | इंटरनेट और मोबाइल बैंकिंग
M atm_cards | ATMs and Cards | एटीएम और कार्ड
M cloud_basics | Cloud Computing Basics | क्लाउड कंप्यूटिंग की मूल बातें

C abbreviations | Computer Abbreviations | कंप्यूटर संक्षिप्ताक्षर | -
T common | Common Abbreviations | सामान्य संक्षिप्ताक्षर | full form
`;

// ── English additions used by banking (appended to the shared ENGLISH library)
export const BANK_ENGLISH_CHAPTERS = String.raw`
C bank_formats | Banking Question Formats | बैंकिंग प्रश्न प्रारूप | english.sentence_improvement
T word_swap | Word Swap | शब्द अदला-बदली | identify the words to swap
M swap_pair | Swap a Pair of Words | शब्द युग्म की अदला-बदली
T phrase_replacement | Phrase Replacement | वाक्यांश प्रतिस्थापन
M replace_phrase | Replace the Bold Phrase | मोटे वाक्यांश का प्रतिस्थापन
T connectors | Connectors and Sentence Joining | संयोजक और वाक्य जोड़ना
M join_sentences | Join Two Sentences | दो वाक्य जोड़ें
T odd_sentence | Odd Sentence Out | असंगत वाक्य
M odd_one | Find the Odd Sentence | असंगत वाक्य ज्ञात करें
T word_usage | Word Usage (Same Word, Different Senses) | शब्द प्रयोग (एक शब्द, अनेक अर्थ)
M usage_sentences | Correct Usage in Sentences | वाक्यों में सही प्रयोग
T column_matching | Column-based Sentence Matching | स्तंभ आधारित वाक्य मिलान
M match_columns | Match Sentence Parts | वाक्य भागों का मिलान

C descriptive | Descriptive English | वर्णनात्मक अंग्रेज़ी | -
T essay | Essay Writing | निबंध लेखन | descriptive writing
M essay_structure | Essay Structure and Topics | निबंध संरचना और विषय
T letter | Letter Writing | पत्र लेखन
M formal_letter | Formal Letters | औपचारिक पत्र
T precis | Précis and Paragraph Writing | सारांश और अनुच्छेद लेखन
`;
