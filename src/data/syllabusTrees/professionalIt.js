/**
 * Professional Knowledge (IT) — IBPS SO IT Officer and IBPS RRB Officer
 * Scale-II (IT). Format: see engine.js. Prefix pk.
 *
 * Part A follows the sections of the official GATE CS/IT syllabus (the
 * baseline the product team chose; IBPS itself prints no topic list, so for
 * IBPS every chapter here is 'supplementary' — see ./bankExams.js).
 * Part B adds Banking-IT specialisation chapters (recommended coverage).
 *
 * Patterns (question categories for AI generation; children inherit):
 *   conceptual  — definition / property / which-statement-is-true
 *   numerical   — compute a value (NAT-style)
 *   trace       — trace code / algorithm / automaton output
 *   design      — choose a design / query / configuration
 */
const C = 'conceptual';
const N = 'numerical';
const T = 'trace';
const DZ = 'design';

export const PROFESSIONAL_IT = String.raw`
C engineering_mathematics | Engineering Mathematics | इंजीनियरिंग गणित | -
T discrete_math | Discrete Mathematics | असतत गणित | ${C}; ${N}
S propositional_logic | Propositional and First-order Logic | प्रस्तावात्मक और प्रथम-क्रम तर्क
M connectives | Connectives, Truth Tables, Tautology | संयोजक, सत्यता सारणी, पुनरुक्ति
M equivalence | Logical Equivalence and Normal Forms | तार्किक तुल्यता और सामान्य रूप
M quantifiers | Predicates and Quantifiers | विधेय और परिमाणक
M inference_rules | Rules of Inference | अनुमान के नियम
S sets_relations | Sets, Relations and Functions | समुच्चय, संबंध और फलन
M set_operations | Set Operations and Power Set | समुच्चय संक्रियाएँ और घात समुच्चय
M relation_properties | Reflexive, Symmetric, Transitive; Equivalence Relations | स्वतुल्य, सममित, संक्रामक; तुल्यता संबंध
M functions | Injective, Surjective, Bijective; Composition | एकैकी, आच्छादक, एकैकी-आच्छादक; संयोजन
M posets_lattices | Partial Orders and Lattices | आंशिक क्रम और जालक
S monoids_groups | Monoids and Groups | मोनॉइड और समूह
M group_axioms | Group Axioms, Subgroups, Cyclic Groups | समूह अभिगृहीत, उपसमूह, चक्रीय समूह
S graph_theory | Graph Theory | ग्राफ सिद्धांत
M connectivity | Connectivity, Paths and Cycles | संयोजकता, पथ और चक्र
M matching | Matching | मिलान
M colouring | Graph Colouring and Chromatic Number | ग्राफ रंगाई और वर्णिक संख्या
M euler_hamilton | Euler and Hamiltonian Graphs; Planarity | ऑयलर और हैमिल्टनी ग्राफ; समतलता
S combinatorics | Combinatorics | संयोजिकी
M counting | Counting, Permutations and Combinations | गणना, क्रमचय और संचय
M recurrence | Recurrence Relations | पुनरावृत्ति संबंध
M generating_functions | Generating Functions | जनक फलन
M pigeonhole_ie | Pigeonhole and Inclusion–Exclusion | कबूतरखाना और समावेश–अपवर्जन
T linear_algebra | Linear Algebra | रैखिक बीजगणित | ${C}; ${N}
M matrices | Matrices and Determinants | आव्यूह और सारणिक
M linear_systems | Systems of Linear Equations; Rank | रैखिक समीकरण निकाय; कोटि
M eigen | Eigenvalues and Eigenvectors | आइगेन मान और आइगेन सदिश
M lu | LU Decomposition | एलयू अपघटन
T calculus | Calculus | कलन | ${N}
M limits_continuity | Limits, Continuity and Differentiability | सीमा, सांतत्य और अवकलनीयता
M maxima_minima | Maxima and Minima | उच्चिष्ठ और निम्निष्ठ
M mean_value | Mean Value Theorem | माध्य मान प्रमेय
M integration | Integration | समाकलन
T probability_statistics | Probability and Statistics | प्रायिकता और सांख्यिकी | ${N}
M random_variables | Random Variables | यादृच्छिक चर
M distributions | Uniform, Normal, Exponential, Poisson, Binomial | समान, सामान्य, घातांकी, प्वासों, द्विपद बंटन
M mean_median_mode | Mean, Median, Mode and Standard Deviation | माध्य, माध्यिका, बहुलक और मानक विचलन
M conditional_bayes | Conditional Probability and Bayes' Theorem | सप्रतिबंध प्रायिकता और बेज़ प्रमेय

C digital_logic | Digital Logic | डिजिटल लॉजिक | -
T boolean_algebra | Boolean Algebra | बूलियन बीजगणित | ${C}; ${N}
M laws | Boolean Laws and De Morgan | बूलियन नियम और डी मॉर्गन
M minimisation | Minimisation and K-maps | न्यूनीकरण और के-मैप
M sop_pos | SOP / POS and Universal Gates | एसओपी / पीओएस और सार्वभौमिक गेट
T combinational | Combinational Circuits | संयोजी परिपथ | ${C}; ${T}
M adders | Half / Full Adders and Subtractors | अर्ध / पूर्ण योजक और व्यवकलक
M mux_decoder | Multiplexers, Decoders, Encoders | मल्टीप्लेक्सर, डिकोडर, एनकोडर
M comparators | Comparators and Code Converters | तुलनित्र और कोड परिवर्तक
T sequential | Sequential Circuits | अनुक्रमिक परिपथ | ${C}; ${T}
M flip_flops | Latches and Flip-flops (SR, JK, D, T) | लैच और फ्लिप-फ्लॉप
M counters | Counters (Synchronous / Asynchronous) | गणक (समकालिक / असमकालिक)
M registers | Shift Registers | शिफ्ट रजिस्टर
M fsm | Finite State Machines (Moore / Mealy) | परिमित अवस्था मशीन (मूर / मीली)
T number_representation | Number Representations and Arithmetic | संख्या निरूपण और अंकगणित | ${N}
M bases | Number Bases and Conversion | संख्या आधार और रूपांतरण
M complements | 1's / 2's Complement; Signed Numbers | 1 / 2 का पूरक; चिह्नित संख्याएँ
M fixed_float | Fixed and Floating Point (IEEE 754) | स्थिर और चल बिंदु (आईईईई 754)

C coa | Computer Organization and Architecture | कंप्यूटर संगठन और वास्तुकला | -
T machine_instructions | Machine Instructions and Addressing Modes | मशीन निर्देश और पता मोड | ${C}; ${N}
M instruction_formats | Instruction Formats | निर्देश प्रारूप
M addressing_modes | Addressing Modes | पता मोड
M isa | RISC vs CISC | रिस्क बनाम सिस्क
T alu_datapath | ALU, Data-path and Control Unit | एएलयू, डेटा-पथ और नियंत्रण इकाई | ${C}
M datapath | Data-path Design | डेटा-पथ डिज़ाइन
M control | Hardwired and Microprogrammed Control | हार्डवायर्ड और माइक्रोप्रोग्राम्ड नियंत्रण
T pipelining | Instruction Pipelining | निर्देश पाइपलाइनिंग | ${N}; ${C}
M pipeline_speedup | Pipeline Stages, Speed-up and Throughput | पाइपलाइन चरण, गति-वृद्धि और थ्रूपुट
M hazards | Pipeline Hazards (Structural, Data, Control) | पाइपलाइन खतरे (संरचनात्मक, डेटा, नियंत्रण)
M forwarding_branch | Forwarding and Branch Prediction | फ़ॉरवर्डिंग और ब्रांच पूर्वानुमान
T memory_hierarchy | Memory Hierarchy | मेमोरी पदानुक्रम | ${N}
M cache_mapping | Cache: Direct, Associative, Set-associative | कैश: प्रत्यक्ष, साहचर्य, समुच्चय-साहचर्य
M cache_performance | Hit Ratio and Average Access Time | हिट अनुपात और औसत अभिगम समय
M write_policies | Write-through and Write-back | राइट-थ्रू और राइट-बैक
M main_memory | Main Memory Organisation | मुख्य मेमोरी संगठन
M secondary_storage | Secondary Storage (Disk Access Time) | द्वितीयक भंडारण (डिस्क अभिगम समय)
T io_interface | I/O Interface | आई/ओ इंटरफ़ेस | ${C}; ${N}
M interrupts | Interrupt and Polling | व्यवधान और पोलिंग
M dma | DMA Mode | डीएमए मोड

C programming_ds | Programming and Data Structures | प्रोग्रामिंग और डेटा संरचनाएँ | professional_it.data_structures
T c_programming | Programming in C | सी में प्रोग्रामिंग | ${T}; ${C}
M data_types_operators | Data Types, Operators and Precedence | डेटा प्रकार, संचालक और वरीयता
M control_flow | Control Flow and Loops | नियंत्रण प्रवाह और लूप
M functions_scope | Functions, Scope and Storage Classes | फ़ंक्शन, स्कोप और भंडारण वर्ग
M recursion | Recursion | पुनरावर्तन
M parameter_passing | Parameter Passing | पैरामीटर पासिंग
M pointers | Pointers, Arrays and Strings | पॉइंटर, ऐरे और स्ट्रिंग
M structures_dynamic | Structures and Dynamic Memory | संरचनाएँ और गतिशील मेमोरी
T linear_ds | Arrays, Stacks, Queues and Linked Lists | ऐरे, स्टैक, क्यू और लिंक्ड लिस्ट | ${T}; ${C}
M arrays | Arrays (Row / Column Major) | ऐरे (पंक्ति / स्तंभ प्रधान)
M stacks | Stacks and Expression Evaluation | स्टैक और व्यंजक मूल्यांकन
M queues | Queues, Circular Queues, Deques | क्यू, वृत्ताकार क्यू, डेक
M linked_lists | Singly, Doubly and Circular Linked Lists | एकल, द्वि और वृत्ताकार लिंक्ड लिस्ट
T trees | Trees | वृक्ष | ${T}; ${N}
M binary_trees | Binary Trees and Traversals | द्विआधारी वृक्ष और ट्रैवर्सल
M bst | Binary Search Trees | द्विआधारी खोज वृक्ष
M avl | Balanced Trees (AVL) | संतुलित वृक्ष (एवीएल)
M heaps | Binary Heaps | द्विआधारी हीप
T graphs_ds | Graphs | ग्राफ | ${C}
M representation | Adjacency Matrix and List | आसन्नता आव्यूह और सूची
T hashing | Hashing | हैशिंग | ${N}
M hash_functions | Hash Functions | हैश फ़ंक्शन
M collisions | Collision Resolution (Chaining, Open Addressing) | टकराव समाधान (चेनिंग, ओपन एड्रेसिंग)

C algorithms | Algorithms | एल्गोरिदम | -
T analysis | Analysis of Algorithms | एल्गोरिदम का विश्लेषण | ${N}; ${C}
M asymptotic | Asymptotic Notation (O, Ω, Θ) | असंपाती संकेतन
M worst_average | Worst, Average and Best Case | सबसे खराब, औसत और सर्वोत्तम स्थिति
M recurrences | Solving Recurrences (Master Theorem) | पुनरावृत्ति हल करना (मास्टर प्रमेय)
T searching_sorting | Searching and Sorting | खोज और छँटाई | ${T}; ${N}
M binary_search | Linear and Binary Search | रैखिक और द्विआधारी खोज
M comparison_sorts | Bubble, Insertion, Selection Sort | बबल, इंसर्शन, सिलेक्शन सॉर्ट
M merge_quick_heap | Merge, Quick and Heap Sort | मर्ज, क्विक और हीप सॉर्ट
M linear_sorts | Counting and Radix Sort | काउंटिंग और रेडिक्स सॉर्ट
T design_techniques | Algorithm Design Techniques | एल्गोरिदम डिज़ाइन तकनीकें | ${DZ}; ${T}
M greedy | Greedy (Huffman, Activity Selection, Fractional Knapsack) | लालची (हफ़मैन, गतिविधि चयन, भिन्नात्मक नैपसैक)
M dynamic_programming | Dynamic Programming (LCS, 0/1 Knapsack, Matrix Chain) | गतिशील प्रोग्रामिंग
M divide_conquer | Divide and Conquer | विभाजन और विजय
T graph_algorithms | Graph Algorithms | ग्राफ एल्गोरिदम | ${T}; ${N}
M traversals | BFS and DFS | बीएफ़एस और डीएफ़एस
M mst | Minimum Spanning Trees (Prim, Kruskal) | न्यूनतम विस्तृत वृक्ष (प्रिम, क्रुस्कल)
M shortest_paths | Shortest Paths (Dijkstra, Bellman-Ford, Floyd-Warshall) | लघुतम पथ
M topological | Topological Sort and Connected Components | सांस्थितिक छँटाई और संयोजित घटक

C theory_of_computation | Theory of Computation | संगणना का सिद्धांत | -
T regular | Regular Languages | नियमित भाषाएँ | ${C}; ${T}
M regex | Regular Expressions | नियमित व्यंजक
M finite_automata | DFA and NFA; Conversion | डीएफ़ए और एनएफ़ए; रूपांतरण
M minimisation | DFA Minimisation | डीएफ़ए न्यूनीकरण
M pumping_regular | Pumping Lemma (Regular) | पम्पिंग लेम्मा (नियमित)
M closure_regular | Closure Properties | संवृत गुणधर्म
T context_free | Context-free Languages | संदर्भ-मुक्त भाषाएँ | ${C}; ${T}
M cfg | Context-free Grammars and Ambiguity | संदर्भ-मुक्त व्याकरण और अस्पष्टता
M pda | Push-down Automata | पुश-डाउन ऑटोमेटा
M normal_forms | CNF and GNF | सीएनएफ़ और जीएनएफ़
M pumping_cfl | Pumping Lemma (CFL) and Closure | पम्पिंग लेम्मा (सीएफ़एल) और संवृतता
T turing | Turing Machines and Undecidability | ट्यूरिंग मशीन और अनिर्णेयता | ${C}
M tm | Turing Machines | ट्यूरिंग मशीन
M decidability | Recursive and Recursively Enumerable Languages | पुनरावर्ती और पुनरावर्ती गणनीय भाषाएँ
M undecidable | Undecidable Problems | अनिर्णेय समस्याएँ

C compiler_design | Compiler Design | संकलक डिज़ाइन | -
T lexical | Lexical Analysis | शाब्दिक विश्लेषण | ${C}; ${T}
M tokens | Tokens, Lexemes and Patterns | टोकन, लेक्सीम और पैटर्न
T parsing | Parsing | पार्सिंग | ${T}; ${N}
M first_follow | FIRST and FOLLOW Sets | FIRST और FOLLOW समुच्चय
M ll1 | Top-down (LL(1)) Parsing | टॉप-डाउन (LL(1)) पार्सिंग
M lr_parsing | Bottom-up Parsing (SLR, CLR, LALR) | बॉटम-अप पार्सिंग
M conflicts | Shift-Reduce and Reduce-Reduce Conflicts | शिफ्ट-रिड्यूस और रिड्यूस-रिड्यूस विरोध
T sdt | Syntax-directed Translation | वाक्य-रचना निर्देशित अनुवाद | ${C}; ${T}
M sdd | S- and L-attributed Definitions | S- और L-गुणित परिभाषाएँ
T runtime | Runtime Environments | रनटाइम वातावरण | ${C}
M activation_records | Activation Records and Stack Allocation | सक्रियण रिकॉर्ड और स्टैक आवंटन
T intermediate_code | Intermediate Code Generation | मध्यवर्ती कोड निर्माण | ${T}
M three_address | Three-address Code | त्रि-पता कोड
T optimisation | Local Optimisation and Data-flow Analysis | स्थानीय अनुकूलन और डेटा-प्रवाह विश्लेषण | ${C}; ${T}
M basic_blocks | Basic Blocks and Flow Graphs | मूल खंड और प्रवाह ग्राफ
M constant_propagation | Constant Propagation | स्थिरांक प्रसार
M liveness | Liveness Analysis | जीवंतता विश्लेषण
M cse | Common Sub-expression Elimination | सामान्य उप-व्यंजक निष्कासन

C operating_systems | Operating Systems | ऑपरेटिंग सिस्टम | professional_it.operating_system
T processes | System Calls, Processes and Threads | सिस्टम कॉल, प्रक्रियाएँ और थ्रेड | ${C}
M system_calls | System Calls | सिस्टम कॉल
M process_states | Process States and PCB | प्रक्रिया अवस्थाएँ और पीसीबी
M threads | Threads and Context Switching | थ्रेड और संदर्भ परिवर्तन
M ipc | Inter-process Communication | अंतर-प्रक्रिया संचार
T scheduling | CPU Scheduling | सीपीयू शेड्यूलिंग | ${N}
M fcfs_sjf | FCFS, SJF, SRTF | एफ़सीएफ़एस, एसजेएफ़, एसआरटीएफ़
M rr_priority | Round Robin and Priority | राउंड रॉबिन और प्राथमिकता
M scheduling_metrics | Waiting, Turnaround and Response Time | प्रतीक्षा, टर्नअराउंड और प्रतिक्रिया समय
T synchronisation | Concurrency and Synchronisation | समवर्तिता और समकालिकता | ${C}; ${T}
M critical_section | Critical Section Problem | क्रिटिकल सेक्शन समस्या
M semaphores | Semaphores and Mutex | सेमाफ़ोर और म्यूटेक्स
M classic_problems | Producer–Consumer, Readers–Writers, Dining Philosophers | उत्पादक–उपभोक्ता, पाठक–लेखक, भोजन करते दार्शनिक
T deadlock | Deadlock | गतिरोध | ${N}; ${C}
M conditions | Necessary Conditions and RAG | आवश्यक शर्तें और आरएजी
M bankers | Banker's Algorithm (Avoidance) | बैंकर एल्गोरिदम (परिहार)
M detection_recovery | Detection and Recovery | पहचान और पुनर्प्राप्ति
T memory_management | Memory Management and Virtual Memory | मेमोरी प्रबंधन और आभासी मेमोरी | ${N}
M paging | Paging and Page Tables | पेजिंग और पेज टेबल
M segmentation | Segmentation | सेगमेंटेशन
M tlb | TLB and Effective Access Time | टीएलबी और प्रभावी अभिगम समय
M page_replacement | Page Replacement (FIFO, LRU, Optimal) | पेज प्रतिस्थापन
M thrashing | Thrashing and Working Set | थ्रैशिंग और वर्किंग सेट
T file_systems | File Systems | फ़ाइल सिस्टम | ${C}; ${N}
M allocation | Contiguous, Linked and Indexed Allocation | सन्निहित, लिंक्ड और अनुक्रमित आवंटन
M disk_scheduling | Disk Scheduling | डिस्क शेड्यूलिंग

C dbms | Database Management Systems | डेटाबेस प्रबंधन प्रणाली | professional_it.dbms
T er_model | ER Model | ईआर मॉडल | ${DZ}; ${C}
M entities | Entities, Attributes and Relationships | संस्थाएँ, गुण और संबंध
M cardinality | Cardinality and Participation | कार्डिनैलिटी और भागीदारी
M er_to_relational | ER to Relational Mapping | ईआर से संबंधपरक मानचित्रण
T relational_model | Relational Model, Algebra and Calculus | संबंधपरक मॉडल, बीजगणित और कलन | ${T}; ${C}
M keys | Super, Candidate, Primary and Foreign Keys | सुपर, उम्मीदवार, प्राथमिक और विदेशी कुंजियाँ
M relational_algebra | Relational Algebra | संबंधपरक बीजगणित
M tuple_calculus | Tuple Relational Calculus | टपल संबंधपरक कलन
T sql | SQL | एसक्यूएल | ${T}; ${DZ}
M ddl_dml | DDL and DML | डीडीएल और डीएमएल
M joins | Joins | जॉइन
M aggregates | Group By, Having and Aggregates | ग्रुप बाय, हैविंग और समुच्चय फलन
M subqueries | Nested and Correlated Subqueries | नेस्टेड और सहसंबद्ध उपप्रश्न
M views_constraints | Views, Constraints and Triggers | व्यू, प्रतिबंध और ट्रिगर
T normalisation | Integrity Constraints and Normal Forms | अखंडता प्रतिबंध और सामान्य रूप | ${C}; ${N}
M fd | Functional Dependencies and Closure | फलनात्मक निर्भरताएँ और संवरक
M normal_forms | 1NF, 2NF, 3NF, BCNF | 1NF, 2NF, 3NF, BCNF
M decomposition | Lossless and Dependency-preserving Decomposition | हानिरहित और निर्भरता-संरक्षी अपघटन
T indexing | File Organisation and Indexing | फ़ाइल संगठन और अनुक्रमण | ${N}
M bplus_trees | B and B+ Trees | बी और बी+ वृक्ष
M index_types | Primary, Clustered and Secondary Indexes | प्राथमिक, क्लस्टर्ड और द्वितीयक अनुक्रमणिकाएँ
T transactions | Transactions and Concurrency Control | लेनदेन और समवर्तिता नियंत्रण | ${C}; ${T}
M acid | ACID Properties | एसिड गुणधर्म
M serialisability | Conflict and View Serialisability | विरोध और दृश्य क्रमबद्धता
M locking | Two-phase Locking and Timestamps | द्वि-चरण लॉकिंग और टाइमस्टैम्प
M recovery | Recoverability and Recovery | पुनर्प्राप्ति योग्यता और पुनर्प्राप्ति

C computer_networks | Computer Networks | कंप्यूटर नेटवर्क | professional_it.networking
T layering | Layering Concepts | परत अवधारणाएँ | ${C}
M osi_tcpip | OSI and TCP/IP Protocol Stacks | ओएसआई और टीसीपी/आईपी स्टैक
M switching | Packet, Circuit and Virtual-circuit Switching | पैकेट, सर्किट और आभासी-सर्किट स्विचिंग
T data_link | Data Link Layer | डेटा लिंक परत | ${N}; ${C}
M framing | Framing | फ़्रेमिंग
M error_detection | Error Detection (CRC, Checksum) | त्रुटि पहचान
M mac | Medium Access Control (CSMA/CD, Aloha) | माध्यम अभिगम नियंत्रण
M ethernet_bridging | Ethernet and Bridging | ईथरनेट और ब्रिजिंग
M flow_control | Sliding Window, Go-Back-N, Selective Repeat | स्लाइडिंग विंडो
T network_layer | Network Layer | नेटवर्क परत | ${N}
M routing | Shortest Path, Flooding, Distance Vector, Link State | रूटिंग प्रोटोकॉल
M ipv4 | IPv4, Fragmentation | आईपीवी4, विखंडन
M subnetting | IP Addressing, CIDR and Subnetting | आईपी पता, सीआईडीआर और सबनेटिंग
M arp_dhcp_icmp | ARP, DHCP, ICMP and NAT | एआरपी, डीएचसीपी, आईसीएमपी और एनएटी
T transport_layer | Transport Layer | परिवहन परत | ${N}; ${C}
M udp_tcp | UDP and TCP | यूडीपी और टीसीपी
M tcp_flow | Flow Control and Congestion Control | प्रवाह और भीड़ नियंत्रण
M sockets | Sockets | सॉकेट
T application_layer | Application Layer | अनुप्रयोग परत | ${C}
M app_protocols | DNS, SMTP, HTTP, FTP, Email | डीएनएस, एसएमटीपी, एचटीटीपी, एफ़टीपी, ईमेल

C java_oop | Java and Object-Oriented Programming | जावा और वस्तु-उन्मुख प्रोग्रामिंग | -
T oop_concepts | OOP Concepts | ओओपी अवधारणाएँ | ${C}; ${T}
M encapsulation | Classes, Objects and Encapsulation | क्लास, ऑब्जेक्ट और एनकैप्सुलेशन
M inheritance | Inheritance | इनहेरिटेंस
M polymorphism | Polymorphism (Overloading, Overriding) | बहुरूपता
M abstraction | Abstraction and Interfaces | अमूर्तता और इंटरफ़ेस
T java | Java Language | जावा भाषा | ${T}
M jvm | JVM, JDK and JRE | जेवीएम, जेडीके और जेआरई
M exceptions | Exception Handling | अपवाद प्रबंधन
M collections | Collections Framework | कलेक्शंस फ़्रेमवर्क
M multithreading | Multithreading | मल्टीथ्रेडिंग
M cpp_basics | C++ OOP Features (Constructors, Virtual Functions) | सी++ ओओपी विशेषताएँ

C software_engineering | Software Engineering | सॉफ़्टवेयर इंजीनियरिंग | professional_it.software_engineering
T sdlc | SDLC Models | एसडीएलसी मॉडल | ${C}
M waterfall_spiral | Waterfall, Spiral, Prototype, V-model | वॉटरफ़ॉल, स्पाइरल, प्रोटोटाइप, वी-मॉडल
M agile | Agile, Scrum and DevOps | एजाइल, स्क्रम और डेवऑप्स
T requirements_design | Requirements and Design | आवश्यकताएँ और डिज़ाइन | ${C}
M srs | SRS and UML Diagrams | एसआरएस और यूएमएल आरेख
M coupling_cohesion | Coupling and Cohesion | युग्मन और संसंजन
T testing | Software Testing | सॉफ़्टवेयर परीक्षण | ${C}; ${N}
M testing_levels | Unit, Integration, System, Acceptance | इकाई, एकीकरण, प्रणाली, स्वीकृति
M black_white_box | Black-box and White-box Testing | ब्लैक-बॉक्स और व्हाइट-बॉक्स परीक्षण
M cyclomatic | Cyclomatic Complexity | साइक्लोमैटिक जटिलता
T project_management | Estimation and Maintenance | आकलन और रखरखाव | ${N}
M cocomo | COCOMO and Function Points | कोकोमो और फ़ंक्शन पॉइंट
M maintenance | Maintenance and Configuration Management | रखरखाव और कॉन्फ़िगरेशन प्रबंधन

C web_technologies | Web Technologies | वेब प्रौद्योगिकियाँ | professional_it.web_technology
T frontend | HTML, CSS and JavaScript | एचटीएमएल, सीएसएस और जावास्क्रिप्ट | ${C}; ${T}
M html | HTML Elements and Forms | एचटीएमएल तत्व और फ़ॉर्म
M css | CSS Selectors and Box Model | सीएसएस चयनकर्ता और बॉक्स मॉडल
M javascript_dom | JavaScript and DOM | जावास्क्रिप्ट और डॉम
T backend_web | Web Servers and Services | वेब सर्वर और सेवाएँ | ${C}
M http_methods | HTTP Methods, Status Codes and Cookies | एचटीटीपी विधियाँ, स्थिति कोड और कुकी
M xml_json | XML and JSON | एक्सएमएल और जेसन
M rest_soap | REST and SOAP Web Services | रेस्ट और सोप वेब सेवाएँ
M server_side | Server-side Scripting (Servlets, JSP, PHP) | सर्वर-साइड स्क्रिप्टिंग

C information_security | Information Security | सूचना सुरक्षा | professional_it.security
T principles | Security Principles | सुरक्षा सिद्धांत | ${C}
M cia | Confidentiality, Integrity, Availability | गोपनीयता, अखंडता, उपलब्धता
M authentication | Authentication, Authorisation and MFA | प्रमाणीकरण, प्राधिकरण और एमएफ़ए
M access_control | Access Control Models | अभिगम नियंत्रण मॉडल
T network_security | Network Security | नेटवर्क सुरक्षा | ${C}
M firewalls | Firewalls, IDS and IPS | फ़ायरवॉल, आईडीएस और आईपीएस
M vpn_ssl | VPN, SSL/TLS and IPSec | वीपीएन, एसएसएल/टीएलएस और आईपीसेक

C cryptography | Cryptography | क्रिप्टोग्राफ़ी | -
T symmetric | Symmetric Cryptography | सममित क्रिप्टोग्राफ़ी | ${C}; ${N}
M classical_ciphers | Classical Ciphers | शास्त्रीय सिफ़र
M des_aes | DES and AES | डीईएस और एईएस
T asymmetric | Public-key Cryptography | सार्वजनिक-कुंजी क्रिप्टोग्राफ़ी | ${N}; ${C}
M rsa | RSA | आरएसए
M diffie_hellman | Diffie–Hellman Key Exchange | डिफ़ी–हेलमैन कुंजी विनिमय
T integrity | Hashing, MAC and Digital Signatures | हैशिंग, मैक और डिजिटल हस्ताक्षर | ${C}
M hash | SHA and MD5 | एसएचए और एमडी5
M pki | Digital Certificates and PKI | डिजिटल प्रमाणपत्र और पीकेआई

C cyber_security | Cyber Security | साइबर सुरक्षा | -
T attacks | Cyber Attacks | साइबर हमले | ${C}
M malware | Malware and Ransomware | मैलवेयर और रैंसमवेयर
M web_attacks | SQL Injection, XSS and CSRF | एसक्यूएल इंजेक्शन, एक्सएसएस और सीएसआरएफ़
M dos | DoS / DDoS | डॉस / डीडॉस
M social_engineering | Phishing and Social Engineering | फ़िशिंग और सोशल इंजीनियरिंग
T cyber_governance | Cyber Law and Response | साइबर कानून और प्रतिक्रिया | ${C}
M it_act | IT Act, 2000 | आईटी अधिनियम, 2000
M cert_in | CERT-In and Incident Response | सर्ट-इन और घटना प्रतिक्रिया
M rbi_cyber | RBI Cyber Security Framework for Banks | बैंकों के लिए आरबीआई साइबर सुरक्षा ढाँचा

C core_banking | Core Banking Solutions | कोर बैंकिंग समाधान | -
T cbs | CBS Architecture | सीबीएस वास्तुकला | ${C}
M cbs_concept | Centralised Banking and CBS Modules | केंद्रीकृत बैंकिंग और सीबीएस मॉड्यूल
M finacle_flexcube | Common CBS Platforms | सामान्य सीबीएस प्लेटफ़ॉर्म
M channels_integration | Channel and Middleware Integration | चैनल और मिडलवेयर एकीकरण

C atm_cards | ATM and Card Technology | एटीएम और कार्ड प्रौद्योगिकी | -
T cards | Cards | कार्ड | ${C}
M card_types | Debit, Credit and Prepaid Cards | डेबिट, क्रेडिट और प्रीपेड कार्ड
M emv | EMV Chip and Contactless (NFC) | ईएमवी चिप और संपर्क रहित (एनएफ़सी)
M tokenisation | Card Tokenisation | कार्ड टोकनाइज़ेशन
T atm | ATM Network | एटीएम नेटवर्क | ${C}
M atm_switch | ATM Switch and Interoperability | एटीएम स्विच और अंतरसंचालनीयता
M pos | POS and Payment Gateways | पीओएस और भुगतान गेटवे

C payment_systems | UPI, IMPS, NEFT and RTGS | यूपीआई, आईएमपीएस, एनईएफ़टी और आरटीजीएस | -
T retail_payments | Retail Payment Systems | खुदरा भुगतान प्रणालियाँ | ${C}
M upi | UPI Architecture | यूपीआई वास्तुकला
M imps | IMPS | आईएमपीएस
M neft | NEFT | एनईएफ़टी
M rtgs | RTGS | आरटीजीएस
M iso_messaging | ISO 20022 and SWIFT Messaging | आईएसओ 20022 और स्विफ़्ट संदेश

C npci | NPCI and Payment Systems | एनपीसीआई और भुगतान प्रणालियाँ | -
T npci_products | NPCI Products | एनपीसीआई उत्पाद | ${C}
M rupay | RuPay | रुपे
M nach_aeps | NACH and AePS | एनएसीएच और एईपीएस
M bbps_fastag | BBPS and NETC FASTag | बीबीपीएस और फ़ास्टैग
M pss_act | Payment and Settlement Systems Act, 2007 | भुगतान और निपटान प्रणाली अधिनियम, 2007

C cloud_computing | Cloud Computing | क्लाउड कंप्यूटिंग | -
T cloud_models | Service and Deployment Models | सेवा और परिनियोजन मॉडल | ${C}
M iaas_paas_saas | IaaS, PaaS, SaaS | आईएएएस, पीएएएस, एसएएएस
M deployment | Public, Private, Hybrid and Community Cloud | सार्वजनिक, निजी, हाइब्रिड और सामुदायिक क्लाउड
M virtualisation | Virtualisation and Containers | आभासीकरण और कंटेनर

C data_warehousing | Data Warehousing and Data Mining | डेटा वेयरहाउसिंग और डेटा माइनिंग | -
T warehousing | Data Warehousing | डेटा वेयरहाउसिंग | ${C}
M etl | ETL | ईटीएल
M olap | OLAP, Star and Snowflake Schema | ओएलएपी, स्टार और स्नोफ़्लेक स्कीमा
T mining | Data Mining | डेटा माइनिंग | ${C}; ${N}
M association | Association Rules (Apriori) | साहचर्य नियम (एप्रियोरी)
M classification_clustering | Classification and Clustering | वर्गीकरण और क्लस्टरिंग
M big_data | Big Data and Hadoop | बिग डेटा और हडूप

C ai_ml | Artificial Intelligence and Machine Learning | कृत्रिम बुद्धिमत्ता और मशीन लर्निंग | -
T ai_basics | AI Basics | एआई की मूल बातें | ${C}
M search | Search Strategies | खोज रणनीतियाँ
M knowledge_representation | Knowledge Representation | ज्ञान निरूपण
T ml | Machine Learning | मशीन लर्निंग | ${C}; ${N}
M supervised | Supervised Learning (Regression, Classification) | पर्यवेक्षित अधिगम
M unsupervised | Unsupervised Learning | अपर्यवेक्षित अधिगम
M neural_networks | Neural Networks and Deep Learning | तंत्रिका नेटवर्क और डीप लर्निंग
M evaluation | Model Evaluation (Accuracy, Precision, Recall) | मॉडल मूल्यांकन
M banking_ai | AI in Banking (Fraud Detection, Credit Scoring, Chatbots) | बैंकिंग में एआई

C it_governance | IT Governance and Audit | आईटी शासन और ऑडिट | -
T frameworks | Governance Frameworks | शासन ढाँचे | ${C}
M cobit_itil | COBIT and ITIL | कोबिट और आईटीआईएल
M iso_27001 | ISO/IEC 27001 | आईएसओ/आईईसी 27001
T audit | IS Audit | आईएस ऑडिट | ${C}
M audit_process | IS Audit Process and Controls | आईएस ऑडिट प्रक्रिया और नियंत्रण
M rbi_it_governance | RBI IT Governance Directions | आरबीआई आईटी शासन निर्देश

C it_risk | IT Risk Management | आईटी जोखिम प्रबंधन | -
T risk | Risk Assessment | जोखिम आकलन | ${C}
M risk_process | Identify, Assess, Mitigate, Monitor | पहचान, आकलन, शमन, निगरानी
M vendor_risk | Outsourcing and Vendor Risk | आउटसोर्सिंग और विक्रेता जोखिम
M data_privacy | Data Protection (DPDP Act, 2023) | डेटा संरक्षण (डीपीडीपी अधिनियम, 2023)

C banking_infrastructure | Banking IT Infrastructure | बैंकिंग आईटी अवसंरचना | -
T infrastructure | Data Centres and Networks | डेटा सेंटर और नेटवर्क | ${C}
M data_centre | Data Centre Tiers | डेटा सेंटर टियर
M bank_networks | Branch Networks, SD-WAN and INFINET | शाखा नेटवर्क, एसडी-वैन और इन्फ़िनेट
M soc | Security Operations Centre | सुरक्षा संचालन केंद्र

C disaster_recovery | Disaster Recovery and Business Continuity | आपदा पुनर्प्राप्ति और व्यवसाय निरंतरता | -
T bcp_dr | BCP and DR | बीसीपी और डीआर | ${C}; ${N}
M rpo_rto | RPO and RTO | आरपीओ और आरटीओ
M dr_sites | Hot, Warm and Cold Sites; Near-DR | हॉट, वार्म और कोल्ड साइट; नियर-डीआर
M backup | Backup Strategies and RAID | बैकअप रणनीतियाँ और रेड

C emerging_technologies | Emerging Banking Technologies | उभरती बैंकिंग प्रौद्योगिकियाँ | -
T fintech | Fintech and New Technologies | फ़िनटेक और नई प्रौद्योगिकियाँ | ${C}
M blockchain | Blockchain and DLT | ब्लॉकचेन और डीएलटी
M cbdc | Central Bank Digital Currency | केंद्रीय बैंक डिजिटल मुद्रा
M open_banking | Open Banking, APIs and Account Aggregators | ओपन बैंकिंग, एपीआई और अकाउंट एग्रीगेटर
M iot_rpa | IoT and Robotic Process Automation | आईओटी और आरपीए
M regtech | RegTech and Regulatory Sandbox | रेगटेक और नियामक सैंडबॉक्स
`;

/** GATE CS/IT sections (Part A); the rest is Banking-IT (Part B). */
export const GATE_CHAPTERS = [
  'engineering_mathematics', 'digital_logic', 'coa', 'programming_ds', 'algorithms',
  'theory_of_computation', 'compiler_design', 'operating_systems', 'dbms', 'computer_networks',
];
export const BANKING_IT_CHAPTERS = [
  'java_oop', 'software_engineering', 'web_technologies', 'information_security', 'cryptography',
  'cyber_security', 'core_banking', 'atm_cards', 'payment_systems', 'npci', 'cloud_computing',
  'data_warehousing', 'ai_ml', 'it_governance', 'it_risk', 'banking_infrastructure',
  'disaster_recovery', 'emerging_technologies',
];
