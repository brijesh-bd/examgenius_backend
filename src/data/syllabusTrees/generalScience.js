/**
 * General Science — shared concept library (Railway). Format: see engine.js.
 * Ids: gs.<chapter>.<topic>.<micro>. Chapters = disciplines.
 * Exam availability (incl. Technician Gr-III's basic-physics-only scope): ./exams.js.
 */
export const GENERAL_SCIENCE = String.raw`
C physics | Physics | भौतिकी | general_science.physics
T units | Units and Measurement | मात्रक और मापन
M si_units | SI Units and Dimensions | SI मात्रक और विमाएँ
M instruments | Measuring Instruments | मापक यंत्र
M mass_density | Mass, Weight and Density | द्रव्यमान, भार और घनत्व
T motion | Motion | गति
M distance_speed | Distance, Displacement, Speed, Velocity | दूरी, विस्थापन, चाल, वेग
M acceleration | Acceleration and Equations of Motion | त्वरण और गति के समीकरण
M circular_motion | Circular Motion | वृत्तीय गति
T force | Force and Laws of Motion | बल और गति के नियम
M newton_laws | Newton's Laws | न्यूटन के नियम
M momentum | Momentum and Impulse | संवेग और आवेग
M friction | Friction | घर्षण
T gravitation | Gravitation | गुरुत्वाकर्षण
M universal_law | Universal Law and g | सार्वत्रिक नियम और g
M free_fall | Free Fall, Mass and Weight | मुक्त पतन, द्रव्यमान और भार
T work_energy | Work, Energy and Power | कार्य, ऊर्जा और शक्ति
M kinetic_potential | Kinetic and Potential Energy | गतिज और स्थितिज ऊर्जा
M power | Power and Commercial Unit | शक्ति और वाणिज्यिक मात्रक
T machines | Simple Machines | सरल मशीनें
M levers | Levers and Simple Machines | उत्तोलक और सरल मशीनें
T pressure | Pressure and Fluids | दाब और तरल
M pressure_buoyancy | Pressure, Buoyancy, Archimedes | दाब, उत्प्लावकता, आर्किमिडीज़
T sound | Sound | ध्वनि
M waves | Waves, Speed and Echo | तरंगें, चाल और प्रतिध्वनि
M hearing | Range of Hearing and Ultrasound | श्रव्यता परिसर और पराध्वनि
T heat | Heat and Temperature | ऊष्मा और ताप
M temperature_scales | Temperature Scales | ताप पैमाने
M heat_transfer | Expansion, Specific Heat, Transfer | प्रसार, विशिष्ट ऊष्मा, स्थानांतरण
M thermodynamics | Thermodynamics (basic) | ऊष्मागतिकी (मूल)
T light | Light | प्रकाश
M reflection | Reflection and Mirrors | परावर्तन और दर्पण
M refraction | Refraction and Lenses | अपवर्तन और लेंस
M eye | Human Eye and Defects | मानव नेत्र और दोष
M dispersion | Dispersion and Scattering | विक्षेपण और प्रकीर्णन
T electricity | Electricity | विद्युत
M ohm_law | Current, Potential and Ohm's Law | धारा, विभव और ओम का नियम
M resistance | Resistance in Series and Parallel | श्रेणी और समांतर प्रतिरोध
M electric_power | Heating Effect and Electric Power | ऊष्मीय प्रभाव और विद्युत शक्ति
T magnetism | Magnetic Effects of Current | धारा के चुंबकीय प्रभाव
M magnetic_field | Magnetic Field and Electromagnet | चुंबकीय क्षेत्र और विद्युत चुंबक
M motor_generator | Motor, Generator and Induction | मोटर, जनित्र और प्रेरण
T modern | Modern Physics (basic) | आधुनिक भौतिकी (मूल)
M radioactivity | Atom, Nucleus and Radioactivity | परमाणु, नाभिक और रेडियोधर्मिता
M semiconductors | Semiconductors (basic) | अर्धचालक (मूल)
T energy_sources | Sources of Energy | ऊर्जा के स्रोत
M renewable | Conventional and Renewable Sources | पारंपरिक और नवीकरणीय स्रोत
T safety | Safety and Environment | सुरक्षा और पर्यावरण
M occupational_safety | Occupational Safety and Health | व्यावसायिक सुरक्षा और स्वास्थ्य
M environment_education | Environment Education | पर्यावरण शिक्षा
M it_literacy | IT Literacy | सूचना प्रौद्योगिकी साक्षरता

C chemistry | Chemistry | रसायन विज्ञान | general_science.chemistry
T matter | Matter | पदार्थ
M states | States of Matter | पदार्थ की अवस्थाएँ
M mixtures | Pure Substances and Mixtures | शुद्ध पदार्थ और मिश्रण
T atom | Atomic Structure | परमाणु संरचना
M models | Atomic Models | परमाणु मॉडल
M electron_configuration | Electronic Configuration and Valency | इलेक्ट्रॉनिक विन्यास और संयोजकता
M isotopes | Isotopes and Isobars | समस्थानिक और समभारिक
T periodic | Periodic Classification | आवर्त वर्गीकरण
M periodic_table | Modern Periodic Table and Trends | आधुनिक आवर्त सारणी और प्रवृत्तियाँ
T bonding | Chemical Bonding | रासायनिक बंधन
M ionic_covalent | Ionic and Covalent Bonds | आयनिक और सहसंयोजक बंध
T reactions | Chemical Reactions | रासायनिक अभिक्रियाएँ
M reaction_types | Types and Balancing | प्रकार और संतुलन
M redox | Oxidation, Reduction, Corrosion | ऑक्सीकरण, अपचयन, संक्षारण
M electrolysis | Electrolysis | विद्युत अपघटन
T acids | Acids, Bases and Salts | अम्ल, क्षार और लवण
M ph | Indicators and pH | सूचक और pH
M salts | Common Salts and Uses | सामान्य लवण और उपयोग
T metals | Metals and Non-metals | धातु और अधातु
M reactivity | Properties and Reactivity Series | गुण और सक्रियता श्रेणी
M metallurgy | Metallurgy and Alloys | धातुकर्म और मिश्रधातु
T carbon | Carbon and Its Compounds | कार्बन और उसके यौगिक
M hydrocarbons | Allotropes and Hydrocarbons | अपररूप और हाइड्रोकार्बन
M functional_groups | Functional Groups, Soaps and Detergents | क्रियात्मक समूह, साबुन और अपमार्जक
M polymers | Polymers, Fibres and Plastics | बहुलक, रेशे और प्लास्टिक
T everyday | Chemistry in Everyday Life | दैनिक जीवन में रसायन
M fuels | Fuels and Combustion | ईंधन और दहन
M common_compounds | Common Names and Formulae | सामान्य नाम और सूत्र
M green_chemistry | Environmental Chemistry | पर्यावरण रसायन

C biology | Biology (Life Sciences) | जीव विज्ञान | general_science.biology
T cell | Cell | कोशिका
M structure | Cell Structure and Organelles | कोशिका संरचना और कोशिकांग
M division | Cell Division | कोशिका विभाजन
T tissues | Tissues | ऊतक
M plant_animal_tissues | Plant and Animal Tissues | पादप और जंतु ऊतक
T diversity | Classification of Organisms | जीवों का वर्गीकरण
M kingdoms | Kingdoms and Classification | जगत और वर्गीकरण
T nutrition | Nutrition | पोषण
M photosynthesis | Nutrition in Plants (Photosynthesis) | पादपों में पोषण (प्रकाश संश्लेषण)
M human_nutrition | Nutrients and Deficiency Diseases | पोषक तत्व और कमी से होने वाले रोग
T physiology | Human Physiology | मानव शरीर क्रिया विज्ञान
M digestive | Digestive System | पाचन तंत्र
M respiratory | Respiratory System | श्वसन तंत्र
M circulatory | Circulatory System and Blood | परिसंचरण तंत्र और रक्त
M excretory | Excretory System | उत्सर्जन तंत्र
M nervous | Nervous System and Sense Organs | तंत्रिका तंत्र और संवेदी अंग
M endocrine | Endocrine System | अंतःस्रावी तंत्र
M skeletal | Skeletal and Muscular System | कंकाल और पेशी तंत्र
T reproduction | Reproduction | जनन
M plant_reproduction | Reproduction in Plants | पादपों में जनन
M human_reproduction | Human Reproduction | मानव जनन
T heredity | Heredity and Evolution | आनुवंशिकता और विकास
M mendel | Mendel's Laws and Genetics | मेंडल के नियम और आनुवंशिकी
M evolution | Evolution | विकास
T health | Health and Diseases | स्वास्थ्य और रोग
M diseases | Communicable and Non-communicable Diseases | संचारी और असंचारी रोग
M immunity | Immunity and Vaccines | प्रतिरक्षा और टीके
T plant_physiology | Plant Physiology | पादप शरीर क्रिया विज्ञान
M plant_hormones | Plant Hormones and Transport | पादप हार्मोन और परिवहन
T ecology | Ecology | पारिस्थितिकी
M ecosystems | Ecosystems and Food Chains | पारिस्थितिक तंत्र और खाद्य श्रृंखला
M pollution | Pollution and Natural Resources | प्रदूषण और प्राकृतिक संसाधन
`;
