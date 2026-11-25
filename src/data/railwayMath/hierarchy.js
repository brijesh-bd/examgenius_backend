/**
 * Railway Mathematics master hierarchy (shared by every Railway exam).
 *
 * One line per node, parsed by ./index.js:
 *   C slug | English | Hindi | practiceTopicId | coverage     chapter
 *   T slug | English | Hindi                                   topic
 *   S slug | English | Hindi | pattern; pattern; …             subtopic (patterns inherited by its micro concepts)
 *   M slug | English | Hindi [| pattern; …]                    micro concept (selectable leaf)
 *
 * Node ids are the slug path: rm.<chapter>.<topic>.<subtopic>.<micro>.
 * They are stable: NEVER rename a slug (practice sets, the question bank and
 * notes store them). Add new slugs instead, and deactivate old ones.
 *
 * coverage = which source evidence covers the chapter (see ./sources.js):
 *   core  – listed for NTPC, Group D, ALP and JE by the retrieved syllabus pages
 *   gdaj  – listed for Group D, ALP and JE; not in the NTPC lists
 *   part  – sub-area of a listed chapter, named only by some coaching pages
 *   extra – not named by any retrieved page (practice extension)
 *
 * Reasoning number/letter series are deliberately NOT here (Reasoning subject).
 */
export const HIERARCHY = String.raw`
C number_system | Number System | संख्या पद्धति | quant.number_system | core
T types | Types of Numbers | संख्याओं के प्रकार
S classification | Classification of Numbers | संख्याओं का वर्गीकरण | Identify the type of a number; Count numbers of a type in a range; True/false statements on number sets
M natural | Natural Numbers | प्राकृत संख्याएँ
M whole | Whole Numbers | पूर्ण संख्याएँ
M integers | Integers | पूर्णांक
M rational | Rational Numbers | परिमेय संख्याएँ
M irrational | Irrational Numbers | अपरिमेय संख्याएँ
M real | Real Numbers | वास्तविक संख्याएँ
S special | Special Numbers | विशेष संख्याएँ | Identify the number; Count in a range; Sum of such numbers in a range
M prime | Prime Numbers | अभाज्य संख्याएँ
M composite | Composite Numbers | भाज्य संख्याएँ
M even_odd | Even and Odd Numbers | सम और विषम संख्याएँ
M coprime | Co-prime Numbers | सह-अभाज्य संख्याएँ
M twin_prime | Twin Primes | जुड़वाँ अभाज्य संख्याएँ
M consecutive | Consecutive Numbers | क्रमागत संख्याएँ | Find the numbers from their sum; Find the product or largest number
T place_value | Place Value and Face Value | स्थानीय मान और अंकित मान
S basics | Place and Face Value | स्थानीय और अंकित मान | Difference of place value and face value; Find the digit at a place; Form the largest/smallest number
M place_value | Place Value | स्थानीय मान
M face_value | Face Value | अंकित मान
M number_formation | Forming Numbers from Digits | अंकों से संख्याएँ बनाना
T divisibility | Divisibility | विभाज्यता
S rules | Divisibility Rules | विभाज्यता के नियम | Find the missing digit; Check divisibility; Find the smallest possible number; Find the greatest possible number; Find the remainder
M by_2 | Divisibility by 2 | 2 से विभाज्यता
M by_3 | Divisibility by 3 | 3 से विभाज्यता
M by_4 | Divisibility by 4 | 4 से विभाज्यता
M by_5 | Divisibility by 5 | 5 से विभाज्यता
M by_6 | Divisibility by 6 | 6 से विभाज्यता
M by_7 | Divisibility by 7 | 7 से विभाज्यता
M by_8 | Divisibility by 8 | 8 से विभाज्यता
M by_9 | Divisibility by 9 | 9 से विभाज्यता
M by_10 | Divisibility by 10 | 10 से विभाज्यता
M by_11 | Divisibility by 11 | 11 से विभाज्यता
M by_12 | Divisibility by 12 | 12 से विभाज्यता
M composite_divisors | Divisibility by Composite Numbers (co-prime factors) | भाज्य संख्याओं से विभाज्यता
T factors | Factors and Multiples | गुणनखंड और गुणज
S factorization | Prime Factorization | अभाज्य गुणनखंडन | Express as product of primes; Find the exponent of a prime; Find the smallest multiplier for a perfect square/cube
M prime_factorization | Prime Factorization | अभाज्य गुणनखंडन
M perfect_square_cube_multiplier | Smallest Multiplier/Divisor for a Perfect Square or Cube | पूर्ण वर्ग/घन के लिए न्यूनतम गुणक/भाजक
S counting | Number and Sum of Factors | गुणनखंडों की संख्या और योग | Find the number of factors; Find the sum of factors; Count even/odd factors
M number_of_factors | Number of Factors | गुणनखंडों की संख्या
M sum_of_factors | Sum of Factors | गुणनखंडों का योग
M even_odd_factors | Even and Odd Factors | सम और विषम गुणनखंड
M multiples_in_range | Multiples in a Range | किसी परिसर में गुणज | Count multiples between two numbers; Sum of multiples in a range
T remainders | Remainders | शेषफल
S division | Division Algorithm | विभाजन एल्गोरिथ्म | Find the dividend/divisor/quotient; Find the remainder; Successive division
M dividend_divisor | Dividend = Divisor × Quotient + Remainder | भाज्य = भाजक × भागफल + शेषफल
M same_number_two_divisors | Same Number Divided by Two Divisors | एक ही संख्या को दो भाजकों से भाग
M remainder_of_sum_product | Remainder of Sums and Products | योग और गुणनफल का शेषफल
M remainder_of_powers | Remainder of Powers | घातों का शेषफल
T unit_digit | Unit Digit and Cyclicity | इकाई अंक और चक्रीयता
S unit_digit | Unit Digit | इकाई अंक | Find the unit digit of a product; Find the unit digit of a power; Find the unit digit of a sum of powers
M unit_digit_product | Unit Digit of a Product | गुणनफल का इकाई अंक
M cyclicity | Cyclicity of Digits (2, 3, 7, 8 and 4, 9) | अंकों की चक्रीयता
M unit_digit_power | Unit Digit of a Power | घात का इकाई अंक
S trailing_zeros | Trailing Zeros | अंत के शून्य | Find the number of zeros at the end; Highest power of a prime in a factorial
M zeros_in_product | Zeros at the End of a Product | गुणनफल के अंत में शून्य
M zeros_in_factorial | Zeros at the End of n! | n! के अंत में शून्य
T operations | Operations on Numbers | संख्याओं पर संक्रियाएँ
S sums | Sums of Numbers | संख्याओं का योग | Sum of first n natural numbers; Sum of squares or cubes; Sum of even/odd numbers
M sum_natural | Sum of First n Natural Numbers | प्रथम n प्राकृत संख्याओं का योग
M sum_squares_cubes | Sum of Squares and Cubes | वर्गों और घनों का योग
M sum_even_odd | Sum of Even and Odd Numbers | सम और विषम संख्याओं का योग
S word_problems | Number Word Problems | संख्या आधारित शाब्दिक प्रश्न | Find the number from conditions; Two-digit number with reversed digits
M digit_reversal | Two-digit Numbers and Reversed Digits | दो अंकों की संख्या और अंकों का पलटना
M number_from_conditions | Finding a Number from Given Conditions | दी गई शर्तों से संख्या ज्ञात करना

C bodmas_simplification | BODMAS and Simplification | BODMAS और सरलीकरण | quant.simplification | gdaj
T bodmas | BODMAS Rule | BODMAS नियम
S order | Order of Operations | संक्रियाओं का क्रम | Simplify the expression; Find the missing number; Find the value of ?
M bodmas_order | BODMAS Order of Operations | BODMAS संक्रिया क्रम
M brackets | Removing Brackets ( ), { }, [ ] and Vinculum | कोष्ठक हटाना
M mixed_operations | Mixed Operations | मिश्रित संक्रियाएँ
T fraction_simplification | Simplifying Fractions and Decimals | भिन्न और दशमलव का सरलीकरण
S fractions | Fraction Expressions | भिन्न व्यंजक | Simplify the expression; Find the missing number
M mixed_fractions | Mixed Fractions | मिश्रित भिन्न
M continued_fractions | Continued Fractions | सतत भिन्न
M decimal_expressions | Decimal Expressions | दशमलव व्यंजक
T powers | Squares, Cubes and Indices | वर्ग, घन और घातांक
S indices | Laws of Indices | घातांक के नियम | Simplify powers; Find the value of x in an exponential equation; Compare powers
M laws_of_indices | Laws of Indices | घातांक के नियम
M negative_zero_exponents | Zero and Negative Exponents | शून्य और ऋणात्मक घातांक
M fractional_exponents | Fractional Exponents | भिन्नात्मक घातांक
M surds | Surds and Rationalisation | करणी और परिमेयीकरण | Simplify surds; Rationalise the denominator; Compare surds
S square_cube_values | Squares and Cubes in Expressions | व्यंजकों में वर्ग और घन | Simplify the expression; Find the missing number
M squares_quick | Quick Squares (numbers near 50, 100) | त्वरित वर्ग
M cubes_quick | Quick Cubes | त्वरित घन
M identity_based_simplification | Simplification Using Algebraic Identities | बीजीय सर्वसमिकाओं से सरलीकरण

C decimals_fractions | Decimals and Fractions | दशमलव और भिन्न | quant.decimals_fractions | core
T fractions | Fractions | भिन्न
S fraction_types | Types of Fractions | भिन्नों के प्रकार | Identify the type; Convert mixed to improper fraction
M proper_improper | Proper, Improper and Mixed Fractions | उचित, अनुचित और मिश्रित भिन्न
M equivalent_fractions | Equivalent Fractions | तुल्य भिन्न
M simplest_form | Fraction in Simplest Form | न्यूनतम रूप में भिन्न
S fraction_ops | Operations and Comparison | संक्रियाएँ और तुलना | Arrange in ascending/descending order; Find the largest/smallest fraction; Add, subtract, multiply or divide fractions
M comparing_fractions | Comparing and Ordering Fractions | भिन्नों की तुलना और क्रम
M fraction_operations | Operations on Fractions | भिन्नों पर संक्रियाएँ
M fraction_of_quantity | Fraction of a Quantity (word problems) | किसी राशि का भिन्न | Find the total from a fraction; Find the remaining part
T decimals | Decimals | दशमलव
S decimal_basics | Decimal Numbers | दशमलव संख्याएँ | Convert fraction to decimal; Convert decimal to fraction; Operations on decimals
M decimal_fraction_conversion | Decimal and Fraction Conversion | दशमलव और भिन्न रूपांतरण
M decimal_operations | Operations on Decimals | दशमलव पर संक्रियाएँ
M terminating_nonterminating | Terminating and Recurring Decimals | सांत और आवर्ती दशमलव
M recurring_to_fraction | Recurring Decimal to Fraction (p/q form) | आवर्ती दशमलव को भिन्न में बदलना

C lcm_hcf | LCM and HCF | LCM और HCF | quant.lcm_hcf | core
T methods | Finding LCM and HCF | LCM और HCF ज्ञात करना
S methods | Methods | विधियाँ | Find the LCM; Find the HCF; Use LCM × HCF = product of two numbers
M prime_factor_method | Prime Factorisation Method | अभाज्य गुणनखंड विधि
M division_method | Division Method | भाग विधि
M lcm_hcf_product | LCM × HCF = Product of Two Numbers | LCM × HCF = दो संख्याओं का गुणनफल
M lcm_hcf_fractions | LCM and HCF of Fractions and Decimals | भिन्नों और दशमलवों का LCM और HCF
T applications | Applications | अनुप्रयोग
S hcf_problems | HCF Word Problems | HCF शाब्दिक प्रश्न | Find the greatest number dividing with remainders; Largest tile/measure; Equal grouping
M greatest_divisor_remainder | Greatest Number Leaving Given Remainders | दिए गए शेषफल छोड़ने वाली सबसे बड़ी संख्या
M largest_measure | Largest Measure / Tile Size | सबसे बड़ा माप / टाइल
S lcm_problems | LCM Word Problems | LCM शाब्दिक प्रश्न | Smallest number leaving a remainder; Bells ringing together; Runners meeting at start
M smallest_number_remainder | Smallest Number Leaving a Given Remainder | दिया गया शेषफल छोड़ने वाली सबसे छोटी संख्या
M bells_lights | Bells, Lights and Events Together | घंटियाँ और लाइटें एक साथ
M greatest_smallest_n_digit | Greatest/Smallest n-digit Number Divisible by Given Numbers | दी गई संख्याओं से विभाज्य सबसे बड़ी/छोटी n-अंकीय संख्या

C ratio_proportion | Ratio and Proportion | अनुपात और समानुपात | quant.ratio_proportion | core
T ratio | Ratio | अनुपात
S ratio_basics | Basic Ratio | मूल अनुपात | Find the ratio; Simplify the ratio; Compare ratios
M basic_ratio | Basic Ratio | मूल अनुपात
M equivalent_ratio | Equivalent Ratios | तुल्य अनुपात
M compound_ratio | Compound Ratio | मिश्र अनुपात
M duplicate_triplicate | Duplicate, Triplicate and Sub-duplicate Ratio | द्विगुणित, त्रिगुणित और उपद्विगुणित अनुपात
M combining_ratios | Combining Ratios (A:B and B:C → A:B:C) | अनुपातों को मिलाना
S ratio_problems | Ratio Word Problems | अनुपात शाब्दिक प्रश्न | Divide an amount in a ratio; Find the new ratio after a change; Coins and notes problems
M distribution | Distribution in a Given Ratio | दिए गए अनुपात में बँटवारा
M changed_ratio | Ratio After Adding or Removing | जोड़ने या घटाने के बाद अनुपात
M coins_notes | Coins and Notes | सिक्के और नोट
M income_expenditure_ratio | Income and Expenditure Ratio | आय और व्यय का अनुपात
T proportion | Proportion | समानुपात
S proportion_types | Types of Proportion | समानुपात के प्रकार | Find the fourth/third/mean proportional; Direct and inverse variation
M fourth_proportional | Fourth Proportional | चतुर्थ समानुपाती
M third_proportional | Third Proportional | तृतीय समानुपाती
M mean_proportional | Mean Proportional | मध्य समानुपाती
M continued_proportion | Continued Proportion | वितत समानुपात
M direct_proportion | Direct Proportion | प्रत्यक्ष समानुपात
M inverse_proportion | Inverse Proportion | व्युत्क्रम समानुपात

C percentage | Percentage | प्रतिशत | quant.percentage | core
T basics | Percentage Basics | प्रतिशत के मूल तत्व
S conversion | Conversion | रूपांतरण | Convert fraction to percentage; Find x% of y; What percent is A of B
M fraction_percent | Fraction and Percentage Conversion | भिन्न और प्रतिशत रूपांतरण
M percent_of_number | Percentage of a Number | किसी संख्या का प्रतिशत
M what_percent | What Percent One Number Is of Another | एक संख्या दूसरी का कितना प्रतिशत है
M percent_more_less | A is x% More/Less than B | A, B से x% अधिक/कम
T change | Percentage Change | प्रतिशत परिवर्तन
S increase_decrease | Increase and Decrease | वृद्धि और कमी | Find the new value; Find the percentage change; Find the original value
M increase_decrease | Percentage Increase and Decrease | प्रतिशत वृद्धि और कमी
M successive_change | Successive Percentage Change | क्रमागत प्रतिशत परिवर्तन
M price_consumption | Price and Consumption | मूल्य और उपभोग
M product_change | Change in Area/Product When Factors Change | गुणनखंड बदलने पर गुणनफल में परिवर्तन
T applications | Applications | अनुप्रयोग
S applied | Applied Problems | व्यावहारिक प्रश्न | Find the final value; Find the original value; Compare two quantities
M population | Population Growth and Decline | जनसंख्या वृद्धि और कमी
M depreciation | Depreciation of Value | मूल्य ह्रास
M income_expenditure | Income, Expenditure and Savings | आय, व्यय और बचत
M marks_exam | Marks, Pass Percentage and Exams | अंक, उत्तीर्ण प्रतिशत और परीक्षा
M elections | Elections and Votes | चुनाव और मत
M mixture_percent | Percentage in Mixtures | मिश्रण में प्रतिशत

C average | Average | औसत | quant.average | part
T basics | Simple Average | साधारण औसत
S simple | Basic Average | मूल औसत | Find the average; Find the sum from the average; Average of consecutive numbers
M simple_average | Simple Average | साधारण औसत
M consecutive_average | Average of Consecutive and Natural Numbers | क्रमागत और प्राकृत संख्याओं का औसत
M missing_value | Finding a Missing Value | लुप्त मान ज्ञात करना
T changes | Change in Average | औसत में परिवर्तन
S replacement | Inclusion, Exclusion and Replacement | सम्मिलन, निष्कासन और प्रतिस्थापन | Find the new average; Find the weight/age of the new person; Find the wrongly copied value
M person_added_removed | A Person Joins or Leaves | किसी व्यक्ति का जुड़ना या हटना
M replacement | Replacement of a Member | सदस्य का प्रतिस्थापन
M wrong_entry | Corrected Average After a Wrong Entry | गलत प्रविष्टि के बाद सही औसत
T weighted | Weighted and Combined Average | भारित और संयुक्त औसत
S weighted | Weighted Average | भारित औसत | Find the combined average; Find the size of a group
M combined_average | Combined Average of Groups | समूहों का संयुक्त औसत
M weighted_average | Weighted Average | भारित औसत
S special_average | Special Averages | विशेष औसत | Find the average age; Find the average speed; Find runs/marks needed
M average_age | Average Age | औसत आयु
M average_speed | Average Speed | औसत चाल
M cricket_marks | Runs, Marks and Scores | रन, अंक और स्कोर

C profit_loss | Profit and Loss | लाभ और हानि | quant.profit_loss | core
T basics | Profit and Loss Basics | लाभ और हानि के मूल तत्व
S cp_sp | Cost Price and Selling Price | क्रय मूल्य और विक्रय मूल्य | Find CP or SP; Find profit or loss percentage; Find the SP for a desired profit
M cost_price | Cost Price | क्रय मूल्य
M selling_price | Selling Price | विक्रय मूल्य
M profit_percent | Profit Percentage | लाभ प्रतिशत
M loss_percent | Loss Percentage | हानि प्रतिशत
M cp_of_n_sp_of_m | CP of n Articles = SP of m Articles | n वस्तुओं का क्रय मूल्य = m वस्तुओं का विक्रय मूल्य
T discount | Marked Price and Discount | अंकित मूल्य और छूट
S discount | Discount | छूट | Find the discount percentage; Find the marked price; Find the equivalent single discount
M marked_price | Marked Price | अंकित मूल्य
M discount_percent | Discount Percentage | छूट प्रतिशत
M successive_discount | Successive Discounts | क्रमागत छूट
M mp_discount_profit | Marked Price, Discount and Profit Together | अंकित मूल्य, छूट और लाभ एक साथ
T special | Special Cases | विशेष स्थितियाँ
S special | Special Profit and Loss Problems | विशेष लाभ-हानि प्रश्न | Find the overall profit or loss; Find the gain percentage of a dishonest dealer
M false_weight | False Weights and Dishonest Dealer | झूठे बाट और बेईमान व्यापारी
M two_articles_same_sp | Two Articles at the Same SP (x% gain, x% loss) | समान विक्रय मूल्य पर दो वस्तुएँ
M multiple_transactions | Successive Transactions (A sells to B to C) | क्रमागत लेन-देन
M overhead_cost | Overhead and Repair Costs | ऊपरी और मरम्मत खर्च

C interest | Simple and Compound Interest | साधारण और चक्रवृद्धि ब्याज | quant.simple_compound_interest | core
T simple_interest | Simple Interest | साधारण ब्याज
S si | Simple Interest | साधारण ब्याज | Find SI; Find the principal, rate or time; Amount becomes n times
M si_formula | SI = P × R × T / 100 | SI = P × R × T / 100
M find_principal_rate_time | Finding Principal, Rate or Time | मूलधन, दर या समय ज्ञात करना
M amount_si | Amount Under Simple Interest | साधारण ब्याज पर मिश्रधन
M n_times | Sum Becomes n Times | राशि n गुनी होना
M instalments_si | Instalments Under Simple Interest | साधारण ब्याज पर किस्तें
T compound_interest | Compound Interest | चक्रवृद्धि ब्याज
S ci | Compound Interest | चक्रवृद्धि ब्याज | Find CI or amount; Find the rate or time; Find the principal
M annual | Annual Compounding | वार्षिक चक्रवृद्धि
M half_yearly | Half-yearly Compounding | अर्धवार्षिक चक्रवृद्धि
M quarterly | Quarterly Compounding | त्रैमासिक चक्रवृद्धि
M different_rates | Different Rates for Successive Years | लगातार वर्षों के लिए अलग दरें
M ci_doubling | Sum Doubles/Triples Under CI | चक्रवृद्धि ब्याज पर राशि दोगुनी/तिगुनी
S comparison | SI and CI Comparison | साधारण और चक्रवृद्धि ब्याज की तुलना | Find the difference between CI and SI; Find the principal from the difference
M ci_si_two_years | Difference Between CI and SI (2 years) | CI और SI का अंतर (2 वर्ष)
M ci_si_three_years | Difference Between CI and SI (3 years) | CI और SI का अंतर (3 वर्ष)
T growth | Growth and Depreciation | वृद्धि और ह्रास
S growth | Growth and Depreciation | वृद्धि और ह्रास | Find the value after n years; Find the original value
M population_growth_ci | Population Growth (compound) | जनसंख्या वृद्धि (चक्रवृद्धि)
M depreciation_ci | Depreciation (compound) | मूल्य ह्रास (चक्रवृद्धि)

C time_work | Time and Work | समय और कार्य | quant.time_work | core
T basics | Work and Efficiency | कार्य और दक्षता
S efficiency | Efficiency | दक्षता | Find days to finish; Compare efficiency; Use the LCM (total work) method
M work_efficiency | Work Efficiency | कार्य दक्षता
M individual_work | Individual Work | व्यक्तिगत कार्य
M lcm_method | Total Work (LCM) Method | कुल कार्य (LCM) विधि
T combined | Combined Work | संयुक्त कार्य
S together | Working Together | साथ मिलकर कार्य | Find days when working together; Find the time of one worker; Remaining work
M working_together | Working Together | साथ मिलकर कार्य
M join_leave | Workers Joining or Leaving | कर्मचारियों का जुड़ना या छोड़ना
M alternate_days | Working on Alternate Days | एकांतर दिनों में कार्य
M men_women_children | Men, Women and Children | पुरुष, महिलाएँ और बच्चे
M mdh_formula | M1D1H1/W1 = M2D2H2/W2 | M1D1H1/W1 = M2D2H2/W2
T wages | Work and Wages | कार्य और मजदूरी
S wages | Wages | मजदूरी | Divide the wages; Find the share of one worker
M wages_by_work | Wages in Proportion to Work Done | किए गए कार्य के अनुपात में मजदूरी

C pipes_cisterns | Pipes and Cisterns | नल और टंकी | quant.pipes_cisterns | gdaj
T basics | Inlet and Outlet Pipes | भरने और खाली करने वाले नल
S pipes | Pipes | नल | Find the time to fill; Find the time to empty; Find the time with all pipes open
M inlet | Inlet Pipes | भरने वाले नल
M outlet | Outlet Pipes | खाली करने वाले नल
M together | Several Pipes Together | कई नल एक साथ
T special | Special Cases | विशेष स्थितियाँ
S leakage | Leakage and Alternate Opening | रिसाव और बारी-बारी से खुलना | Find the time with a leak; Find the time a leak takes to empty; Pipes opened alternately
M leakage | Leakage | रिसाव
M alternate_opening | Pipes Opened Alternately or Closed After Some Time | बारी-बारी से खुले या कुछ समय बाद बंद नल
M capacity | Capacity of the Tank | टंकी की क्षमता

C time_speed_distance | Time, Speed and Distance | समय, चाल और दूरी | quant.time_speed_distance | core
T basics | Speed, Distance and Time | चाल, दूरी और समय
S basics | Basic Relation | मूल संबंध | Find speed, distance or time; Convert units; Late/early arrival
M sdt_relation | Distance = Speed × Time | दूरी = चाल × समय
M unit_conversion | km/h and m/s Conversion | km/h और m/s रूपांतरण
M late_early | Reaching Late or Early | देर या जल्दी पहुँचना
M speed_ratio | Ratio of Speeds and Times | चाल और समय का अनुपात
T average_speed | Average Speed | औसत चाल
S avg | Average Speed | औसत चाल | Find the average speed of a journey
M equal_distances | Equal Distances at Different Speeds | समान दूरी अलग-अलग चाल से
M equal_times | Equal Times at Different Speeds | समान समय अलग-अलग चाल से
T relative_speed | Relative Speed | सापेक्ष चाल
S relative | Relative Motion | सापेक्ष गति | Time to meet; Time to catch up; Distance between them after some time
M same_direction | Moving in the Same Direction | एक ही दिशा में चलना
M opposite_direction | Moving in Opposite Directions | विपरीत दिशाओं में चलना
M meeting_point | Meeting Point of Two Bodies | दो वस्तुओं का मिलन बिंदु
T races | Races and Circular Tracks | दौड़ और वृत्ताकार पथ
S races | Races | दौड़ | Find the lead distance; Find who wins and by how much
M linear_race | Linear Races (start and lead) | रेखीय दौड़
M circular_track | Circular Track Meetings | वृत्ताकार पथ पर मिलना

C trains | Problems on Trains | रेलगाड़ी पर प्रश्न | quant.time_speed_distance | part
T crossing | Train Crossing | रेलगाड़ी का पार करना
S stationary | Crossing Stationary Objects | स्थिर वस्तुओं को पार करना | Find the time to cross; Find the length of the train; Find the speed of the train
M crossing_pole | Crossing a Pole or Person | खंभे या व्यक्ति को पार करना
M crossing_platform | Crossing a Platform or Bridge | प्लेटफॉर्म या पुल को पार करना
M crossing_tunnel | Passing Through a Tunnel | सुरंग से गुजरना
S moving | Crossing Moving Objects | गतिशील वस्तुओं को पार करना | Find the crossing time; Find the length or speed of one train
M two_trains_opposite | Two Trains in Opposite Directions | विपरीत दिशाओं में दो रेलगाड़ियाँ
M two_trains_same | Two Trains in the Same Direction | एक ही दिशा में दो रेलगाड़ियाँ
M train_and_person | Train and a Moving Person or Car | रेलगाड़ी और गतिशील व्यक्ति/कार
T meeting | Trains Meeting | रेलगाड़ियों का मिलना
S meeting | Departure and Meeting | प्रस्थान और मिलन | Find the meeting time; Find the distance from a station
M meeting_time | Trains Starting at Different Times | अलग-अलग समय पर चलने वाली रेलगाड़ियाँ
M after_meeting | Times Taken After Meeting (√ ratio rule) | मिलने के बाद लिया गया समय

C boats_streams | Boats and Streams | नाव और धारा | quant.time_speed_distance | part
T basics | Upstream and Downstream | धारा के प्रतिकूल और अनुकूल
S speeds | Speeds | चाल | Find the speed in still water; Find the stream speed; Find the time for a trip
M downstream | Downstream Speed | धारा के अनुकूल चाल
M upstream | Upstream Speed | धारा के प्रतिकूल चाल
M still_water_stream | Speed in Still Water and Stream Speed | शांत जल में चाल और धारा की चाल
T trips | Trips | यात्राएँ
S trips | Round and One-way Trips | आने-जाने और एक तरफ की यात्रा | Find the distance; Find the total time; Average speed of the round trip
M round_trip | Round Trip Time | आने-जाने का समय
M time_ratio | Upstream and Downstream Time Ratio | प्रतिकूल और अनुकूल समय का अनुपात

C ages | Problems on Ages | आयु संबंधी प्रश्न | quant.age_problems | gdaj
T ages | Age Calculations | आयु गणना
S present_past_future | Present, Past and Future Ages | वर्तमान, भूत और भविष्य की आयु | Find the present age; Find the age after/before n years; Find the age ratio
M present_age | Present Age from Conditions | शर्तों से वर्तमान आयु
M ratio_of_ages | Ratio of Ages | आयु का अनुपात
M sum_difference_ages | Sum and Difference of Ages | आयु का योग और अंतर
M average_age_family | Average Age of a Family | परिवार की औसत आयु
M date_of_birth | Age from Date of Birth | जन्म तिथि से आयु

C algebra | Algebra | बीजगणित | quant.algebra | core
T expressions | Algebraic Expressions | बीजीय व्यंजक
S basics | Expressions | व्यंजक | Find the value of an expression; Simplify the expression
M terms_coefficients | Terms, Coefficients and Like Terms | पद, गुणांक और समान पद
M value_of_expression | Value of an Expression | व्यंजक का मान
T identities | Algebraic Identities | बीजीय सर्वसमिकाएँ
S identities | Standard Identities | मानक सर्वसमिकाएँ | Find the value using an identity; Simplify using an identity
M square_identities | (a ± b)² and a² − b² | (a ± b)² और a² − b²
M cube_identities | (a ± b)³ and a³ ± b³ | (a ± b)³ और a³ ± b³
M three_variable | (a + b + c)² and a³ + b³ + c³ − 3abc | तीन चर वाली सर्वसमिकाएँ
M x_plus_1_by_x | x + 1/x Type Problems | x + 1/x प्रकार के प्रश्न
T equations | Linear Equations | रैखिक समीकरण
S one_variable | Equations in One Variable | एक चर वाले समीकरण | Solve for x; Form and solve an equation from a statement
M linear_one_var | Linear Equation in One Variable | एक चर में रैखिक समीकरण
M equation_word_problems | Word Problems Leading to Equations | समीकरण बनाने वाले शाब्दिक प्रश्न
S two_variables | Simultaneous Equations | युगपत समीकरण | Solve the pair; Find x + y or xy; Condition for unique/no/infinite solutions
M simultaneous | Solving Two Linear Equations | दो रैखिक समीकरण हल करना
M consistency | Consistency of a Pair of Equations | समीकरण युग्म की संगति
T polynomials | Polynomials and Factorisation | बहुपद और गुणनखंडन
S polynomials | Polynomials | बहुपद | Find the degree; Find the remainder; Factorise; Find the zeros
M degree | Degree of a Polynomial | बहुपद की घात
M remainder_theorem | Remainder and Factor Theorem | शेषफल और गुणनखंड प्रमेय
M factorisation | Factorisation | गुणनखंडन
M quadratic_basics | Roots of a Simple Quadratic | सरल द्विघात के मूल

C geometry | Geometry | ज्यामिति | quant.geometry | core
T lines_angles | Lines and Angles | रेखाएँ और कोण
S angles | Angles | कोण | Find the unknown angle; Find the complement/supplement
M angle_types | Types of Angles | कोणों के प्रकार
M complementary_supplementary | Complementary and Supplementary Angles | पूरक और संपूरक कोण
M parallel_transversal | Parallel Lines and a Transversal | समांतर रेखाएँ और तिर्यक रेखा
T triangles | Triangles | त्रिभुज
S triangle_basics | Triangle Properties | त्रिभुज के गुण | Find the angle; Check if a triangle is possible; Classify the triangle
M angle_sum | Angle Sum and Exterior Angle | कोण योग और बाह्य कोण
M triangle_types | Types of Triangles | त्रिभुजों के प्रकार
M side_inequality | Triangle Inequality | त्रिभुज असमिका
S triangle_theorems | Triangle Theorems | त्रिभुज प्रमेय | Find the length of a side; Find the ratio of areas
M pythagoras | Pythagoras Theorem and Triplets | पाइथागोरस प्रमेय और त्रिक
M congruence | Congruence (SSS, SAS, ASA, RHS) | सर्वांगसमता
M similarity | Similar Triangles | समरूप त्रिभुज
M centres | Centroid, Incentre, Circumcentre, Orthocentre | केंद्रक, अंतःकेंद्र, परिकेंद्र, लंबकेंद्र
M midpoint_bpt | Mid-point and Basic Proportionality Theorems | मध्य-बिंदु और आधारभूत समानुपातिकता प्रमेय
T quadrilaterals | Quadrilaterals and Polygons | चतुर्भुज और बहुभुज
S quads | Quadrilaterals | चतुर्भुज | Find the angle; Use properties of the figure
M parallelogram_props | Parallelogram, Rectangle, Rhombus, Square | समांतर चतुर्भुज, आयत, समचतुर्भुज, वर्ग
M trapezium_props | Trapezium | समलंब चतुर्भुज
S polygons | Polygons | बहुभुज | Find the number of sides; Find the interior/exterior angle; Count diagonals
M polygon_angles | Interior and Exterior Angles of a Polygon | बहुभुज के अंतः और बाह्य कोण
M diagonals | Number of Diagonals | विकर्णों की संख्या
T circles | Circles | वृत्त
S circles | Circle Properties | वृत्त के गुण | Find the length of a chord; Find the angle; Find the tangent length
M chords | Chords and Distance from Centre | जीवा और केंद्र से दूरी
M angles_in_circle | Angles Subtended by Arcs | चापों द्वारा अंतरित कोण
M cyclic_quadrilateral | Cyclic Quadrilateral | चक्रीय चतुर्भुज
M tangents | Tangents | स्पर्श रेखाएँ
T coordinate | Coordinate Geometry Basics | निर्देशांक ज्यामिति के मूल तत्व
S coordinate | Points and Lines | बिंदु और रेखाएँ | Find the distance; Find the midpoint; Find the slope
M distance_formula | Distance Formula | दूरी सूत्र
M section_midpoint | Section and Mid-point Formula | विभाजन और मध्य-बिंदु सूत्र
M slope | Slope of a Line | रेखा की ढलान

C mensuration_2d | Mensuration — 2D | क्षेत्रमिति — 2D | quant.mensuration | core
T rectilinear | Rectilinear Figures | सरल रेखीय आकृतियाँ
S squares_rectangles | Square and Rectangle | वर्ग और आयत | Find the area; Find the perimeter; Find the diagonal; Effect of change in sides
M square | Square | वर्ग
M rectangle | Rectangle | आयत
M paths | Paths and Borders | पथ और किनारे
S triangles_area | Triangles | त्रिभुज | Find the area; Find the height; Find the side
M triangle_area | Area of a Triangle (½ × base × height) | त्रिभुज का क्षेत्रफल
M herons_formula | Heron's Formula | हीरोन का सूत्र
M equilateral | Equilateral Triangle | समबाहु त्रिभुज
M right_isosceles | Right and Isosceles Triangles | समकोण और समद्विबाहु त्रिभुज
S quads_area | Other Quadrilaterals | अन्य चतुर्भुज | Find the area; Find a missing side or diagonal
M parallelogram | Parallelogram | समांतर चतुर्भुज
M rhombus | Rhombus | समचतुर्भुज
M trapezium | Trapezium | समलंब चतुर्भुज
T circular | Circular Figures | वृत्ताकार आकृतियाँ
S circle | Circle | वृत्त | Find the area; Find the circumference; Revolutions of a wheel
M circle | Circle | वृत्त
M semicircle | Semicircle | अर्धवृत्त
M sector_arc | Sector and Arc | त्रिज्यखंड और चाप
M ring | Ring (annulus) | वलय
M wheel_revolutions | Wheel Revolutions | पहिये के चक्कर
T composite | Composite Figures | संयुक्त आकृतियाँ
S composite | Combinations | संयोजन | Find the shaded area; Find the cost of fencing or flooring
M shaded_area | Shaded Region Area | छायांकित भाग का क्षेत्रफल
M cost_problems | Cost of Fencing, Flooring and Painting | बाड़, फर्श और पेंटिंग की लागत

C mensuration_3d | Mensuration — 3D | क्षेत्रमिति — 3D | quant.mensuration | core
T prisms | Cube and Cuboid | घन और घनाभ
S cuboids | Cube and Cuboid | घन और घनाभ | Find the volume; Find the total/lateral surface area; Find the diagonal
M cube | Cube | घन
M cuboid | Cuboid | घनाभ
M room_walls | Four Walls of a Room | कमरे की चार दीवारें
T round_solids | Cylinder, Cone and Sphere | बेलन, शंकु और गोला
S round | Round Solids | गोल ठोस | Find the volume; Find the curved/total surface area; Find the radius or height
M cylinder | Cylinder | बेलन
M hollow_cylinder | Hollow Cylinder (pipe) | खोखला बेलन
M cone | Cone | शंकु
M sphere | Sphere | गोला
M hemisphere | Hemisphere | अर्धगोला
T others | Prism, Pyramid and Combinations | प्रिज्म, पिरामिड और संयोजन
S prism_pyramid | Prism and Pyramid | प्रिज्म और पिरामिड | Find the volume; Find the surface area
M prism | Right Prism | लंब प्रिज्म
M pyramid | Pyramid | पिरामिड
S combinations | Combined and Recast Solids | संयुक्त और पुनः ढाले ठोस | Find the number of small solids; Find the new dimension; Find the surface area of the combination
M melting_recasting | Melting and Recasting | पिघलाकर पुनः ढालना
M combined_solids | Combined Solids | संयुक्त ठोस
M change_in_dimensions | Effect of Changing Dimensions | आयाम बदलने का प्रभाव

C trigonometry | Trigonometry | त्रिकोणमिति | quant.trigonometry | core
T ratios | Trigonometric Ratios | त्रिकोणमितीय अनुपात
S ratios | Ratios | अनुपात | Find the other ratios from one; Evaluate the expression
M six_ratios | sin, cos, tan, cosec, sec, cot | छह त्रिकोणमितीय अनुपात
M reciprocal_relations | Reciprocal and Quotient Relations | व्युत्क्रम और भागफल संबंध
M ratios_from_one | Finding All Ratios from One | एक अनुपात से सभी अनुपात ज्ञात करना
S standard_angles | Standard Angles | मानक कोण | Evaluate using standard values; Find the angle
M standard_values | Values at 0°, 30°, 45°, 60°, 90° | 0°, 30°, 45°, 60°, 90° पर मान
M complementary_angles | Complementary Angles (sin(90° − θ) = cos θ) | पूरक कोण
T identities | Trigonometric Identities | त्रिकोणमितीय सर्वसमिकाएँ
S identities | Identities | सर्वसमिकाएँ | Simplify the expression; Prove/find the value; Max and min value
M pythagorean_identities | sin²θ + cos²θ = 1 and Related Identities | sin²θ + cos²θ = 1 और संबंधित सर्वसमिकाएँ
M identity_values | Values Using Identities (sec θ + tan θ type) | सर्वसमिकाओं से मान
M max_min | Maximum and Minimum Values | अधिकतम और न्यूनतम मान
T heights_distances | Heights and Distances | ऊँचाई और दूरी
S heights | Elevation and Depression | उन्नयन और अवनमन | Find the height; Find the distance; Find the angle
M elevation | Angle of Elevation | उन्नयन कोण
M depression | Angle of Depression | अवनमन कोण
M two_observations | Two Observation Points | दो प्रेक्षण बिंदु

C statistics | Elementary Statistics | प्रारंभिक सांख्यिकी | quant.statistics | core
T central_tendency | Measures of Central Tendency | केंद्रीय प्रवृत्ति के माप
S mean_median_mode | Mean, Median and Mode | माध्य, माध्यिका और बहुलक | Find the mean; Find the median; Find the mode; Use the empirical relation
M mean_ungrouped | Mean of Ungrouped Data | असमूहित आँकड़ों का माध्य
M mean_frequency | Mean of a Frequency Distribution | बारंबारता बंटन का माध्य
M median | Median | माध्यिका
M mode | Mode | बहुलक
M empirical_relation | Mode = 3 Median − 2 Mean | बहुलक = 3 माध्यिका − 2 माध्य
T dispersion | Range and Frequency | परिसर और बारंबारता
S dispersion | Spread of Data | आँकड़ों का फैलाव | Find the range; Read a frequency table; Find a missing frequency
M range | Range | परिसर
M frequency_table | Frequency Tables and Class Intervals | बारंबारता सारणी और वर्ग अंतराल
M missing_frequency | Missing Frequency | लुप्त बारंबारता

C data_interpretation | Data Interpretation | आँकड़ों का निर्वचन | quant.data_interpretation | part
T charts | Data Representation | आँकड़ों का प्रस्तुतीकरण
S chart_types | Chart Types | चार्ट के प्रकार | Read the value; Find the percentage change; Find the ratio; Find the average
M table | Tables | सारणी
M bar_graph | Bar Graph | दंड आलेख
M line_graph | Line Graph | रेखा आलेख
M pie_chart | Pie Chart | पाई चार्ट
M mixed_graph | Mixed Graphs | मिश्रित आलेख
T calculations | DI Calculations | DI गणनाएँ
S calc | Calculation Types | गणना के प्रकार | Calculate from the given data; Compare two years or items
M percentage_di | Percentage-based DI | प्रतिशत आधारित DI
M ratio_di | Ratio-based DI | अनुपात आधारित DI
M average_di | Average-based DI | औसत आधारित DI
M missing_data | Missing Data | लुप्त आँकड़े

C square_cube_root | Square Root and Cube Root | वर्गमूल और घनमूल | quant.simplification | gdaj
T square_root | Square Root | वर्गमूल
S square_root | Square Roots | वर्गमूल | Find the square root; Find the missing number; Smallest number to add/subtract for a perfect square
M perfect_squares | Perfect Squares and Their Properties | पूर्ण वर्ग और उनके गुण
M prime_factor_sqrt | Square Root by Prime Factorisation | अभाज्य गुणनखंड से वर्गमूल
M long_division_sqrt | Square Root by Long Division | लंबी भाग विधि से वर्गमूल
M decimal_fraction_sqrt | Square Roots of Decimals and Fractions | दशमलव और भिन्नों के वर्गमूल
M nearest_perfect_square | Nearest Perfect Square | निकटतम पूर्ण वर्ग
T cube_root | Cube Root | घनमूल
S cube_root | Cube Roots | घनमूल | Find the cube root; Smallest multiplier for a perfect cube
M perfect_cubes | Perfect Cubes | पूर्ण घन
M cube_root_unit_digit | Cube Root by Unit-digit Method | इकाई अंक विधि से घनमूल
M cube_root_factorisation | Cube Root by Prime Factorisation | अभाज्य गुणनखंड से घनमूल

C calendar_clock | Calendar and Clock | कैलेंडर और घड़ी | - | gdaj
T calendar | Calendar | कैलेंडर
S calendar | Days and Dates | दिन और तारीख | Find the day of the week for a date; Find odd days; Find years with the same calendar
M odd_days | Odd Days | विषम दिन
M leap_year | Leap Years | लीप वर्ष
M day_of_date | Day of the Week for a Given Date | दी गई तारीख का दिन
M repeating_calendar | Repeating Calendars | दोहराने वाले कैलेंडर
T clock | Clock | घड़ी
S clock | Hands of a Clock | घड़ी की सुइयाँ | Find the angle between the hands; Find when the hands coincide; Find the time gained or lost
M angle_between_hands | Angle Between the Hands | सुइयों के बीच का कोण
M hands_coincide | Hands Coinciding, Opposite or at Right Angles | सुइयों का मिलना, विपरीत या समकोण होना
M fast_slow_clock | Fast and Slow Clocks | तेज और धीमी घड़ियाँ

C mixture_alligation | Mixture and Alligation | मिश्रण और एलीगेशन | quant.ratio_proportion | extra
T alligation | Alligation | एलीगेशन
S alligation | Rule of Alligation | एलीगेशन का नियम | Find the mixing ratio; Find the mean price; Find the quantity to add
M alligation_rule | Rule of Alligation | एलीगेशन का नियम
M mean_price | Mean Price of a Mixture | मिश्रण का माध्य मूल्य
T mixtures | Mixtures | मिश्रण
S mixtures | Mixture Problems | मिश्रण प्रश्न | Find the new ratio; Find the quantity replaced; Find the final concentration
M mixing_two | Mixing Two Mixtures | दो मिश्रणों को मिलाना
M replacement | Repeated Replacement | बार-बार प्रतिस्थापन
M adding_water | Adding Water or a Component | पानी या घटक मिलाना

C partnership | Partnership | साझेदारी | quant.ratio_proportion | part
T partnership | Partnership | साझेदारी
S partnership | Sharing Profit | लाभ का बँटवारा | Find each partner's share; Find the investment or time of one partner
M simple_partnership | Simple Partnership (same time) | सरल साझेदारी
M compound_partnership | Compound Partnership (different times) | मिश्र साझेदारी
M working_partner | Working and Sleeping Partners | सक्रिय और निष्क्रिय साझेदार
M changing_investment | Investment Changed Mid-year | वर्ष के बीच निवेश में परिवर्तन

C approximation | Approximation and Basic Calculation | सन्निकटन और मूल गणना | quant.simplification | extra
T approximation | Approximation | सन्निकटन
S approx | Approximate Values | सन्निकट मान | Find the approximate value of ?; Choose the nearest value
M rounding | Rounding Off | पूर्णांकन
M approx_expressions | Approximate Value of Expressions | व्यंजकों का सन्निकट मान
M approx_roots_percent | Approximate Roots and Percentages | सन्निकट मूल और प्रतिशत
T fast_calc | Fast Calculation | त्वरित गणना
S tricks | Calculation Techniques | गणना तकनीकें | Calculate quickly; Find the product or quotient
M multiplication_tricks | Multiplication Shortcuts | गुणा के शॉर्टकट
M division_tricks | Division Shortcuts | भाग के शॉर्टकट
`;
