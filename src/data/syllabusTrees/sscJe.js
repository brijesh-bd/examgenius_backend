/**
 * SSC Junior Engineer Examination, 2026 — technical syllabus (Notice of
 * 02.09.2026, para 14.3 Paper-II; Paper-I engineering part = same heads,
 * para 14.2). One library per discipline; disciplines never share nodes.
 * Every chapter/topic is printed in the notice (mapped verifiedAll).
 * Parts D–G (Scientific Assistant IMD, JE Telecom) are not implemented.
 */

// Part-A General Engineering (Civil & Structural), para 14.3.1
export const JE_CIVIL = String.raw`
C engineering_mechanics | Engineering Mechanics | अभियांत्रिकी यांत्रिकी | -
T forces_equilibrium | System of Forces, Free-body Diagrams, Equilibrium Equations | बल निकाय, मुक्त-पिंड आरेख, संतुलन समीकरण
T internal_forces | Internal Forces in Structures | संरचनाओं में आंतरिक बल
T friction | Friction and its Applications | घर्षण और उसके अनुप्रयोग
T centre_mass_moi | Centre of Mass, Moment of Inertia | द्रव्यमान केंद्र, जड़त्व आघूर्ण
C solid_mechanics | Solid Mechanics | ठोस यांत्रिकी | -
T bm_sf | Bending Moment and Shear Force in Statically Determinate Beams | स्थैतिकतः निर्धार्य धरनों में बंकन आघूर्ण और अपरूपण बल
T stress_strain | Simple Stress and Strain Relationships | सरल प्रतिबल और विकृति संबंध
T bending_torsion | Simple Bending Theory, Flexural and Shear Stresses, Uniform Torsion | सरल बंकन सिद्धांत, नमन और अपरूपण प्रतिबल, समरूप ऐंठन
T columns | Buckling of Column, Combined and Direct Bending Stresses | स्तंभ का बकलन, संयुक्त और प्रत्यक्ष बंकन प्रतिबल
C structural_analysis | Structural Analysis | संरचनात्मक विश्लेषण | -
T determinacy | Statically Determinate and Indeterminate Structures, Superposition | स्थैतिकतः निर्धार्य और अनिर्धार्य संरचनाएँ, अध्यारोपण
T trusses_arches | Analysis of Trusses, Arches, Beams, Cables and Frames | कैंची, मेहराब, धरन, केबल और ढाँचों का विश्लेषण
T slope_moment | Slope Deflection and Moment Distribution Methods | ढलान विक्षेप और आघूर्ण वितरण विधियाँ
T influence_lines | Influence Lines | प्रभाव रेखाएँ
C materials_management | Construction Materials and Management | निर्माण सामग्री और प्रबंधन | -
T materials | Bricks, Stones, Timber, Steel, Cement, Aggregates, Plastics, Polymers, Glass | ईंट, पत्थर, लकड़ी, इस्पात, सीमेंट, समुच्चय, प्लास्टिक, बहुलक, काँच
T concrete | Concrete, Concrete Mix Design, Testing of Concrete | कंक्रीट, कंक्रीट मिश्रण डिज़ाइन, कंक्रीट परीक्षण
T management | Construction Projects, Project Planning, PERT and CPM | निर्माण परियोजनाएँ, परियोजना योजना, PERT और CPM
C estimating | Estimating, Costing and Valuation | प्राक्कलन, लागत निर्धारण और मूल्यांकन | -
T estimates | Fundamentals of Estimating, Cost Estimates, Detailed Estimates | प्राक्कलन के मूल सिद्धांत, लागत प्राक्कलन, विस्तृत प्राक्कलन
T rate_valuation | Rate Analysis and Valuation | दर विश्लेषण और मूल्यांकन
C concrete_structures | Concrete Structures | कंक्रीट संरचनाएँ | -
T design_concepts | Working Stress and Limit State Design Concepts | कार्यकारी प्रतिबल और सीमा अवस्था डिज़ाइन अवधारणाएँ
T members | Design of Beams, Slabs, Columns | धरन, स्लैब, स्तंभ का डिज़ाइन
T foundations | Foundations and Retaining Walls | नींव और प्रतिधारक दीवारें
T bond | Bond and Development Length | बंध और विकास लंबाई
C steel_structures | Steel Structures | इस्पात संरचनाएँ | -
T steel_design_concepts | Working Stress and Limit State Design Concepts | कार्यकारी प्रतिबल और सीमा अवस्था डिज़ाइन अवधारणाएँ
T connections | Bolted Connections and Welds | बोल्ट युक्त जोड़ और वेल्ड
T steel_members | Design of Tension Members, Compression Members and Beams | तनाव सदस्यों, संपीड़न सदस्यों और धरनों का डिज़ाइन
T plastic_analysis | Plastic Analysis of Beams and Frames | धरनों और ढाँचों का प्लास्टिक विश्लेषण
C surveying | Surveying | सर्वेक्षण | -
T principles_errors | Principles of Surveying, Errors and their Adjustment, Maps | सर्वेक्षण के सिद्धांत, त्रुटियाँ और समायोजन, मानचित्र
T chain_compass | Chain and Compass Survey, Plane Table Surveying | जरीब और कम्पास सर्वेक्षण, समतल पटल सर्वेक्षण
T levelling | Levelling and Trigonometric Levelling | तलेक्षण और त्रिकोणमितीय तलेक्षण
T traverse | Traversing and Triangulation Survey | माला-रेखन और त्रिभुजन सर्वेक्षण
T instruments | Total Station, Tacheometric and Theodolite Surveying, Advanced Equipment | टोटल स्टेशन, टैकियोमेट्रिक और थियोडोलाइट सर्वेक्षण, उन्नत उपकरण
C soil_mechanics | Soil Mechanics (Geotechnical Engineering) | मृदा यांत्रिकी (भू-तकनीकी अभियांत्रिकी) | -
T phase_index | Three-phase System, Phase Relationships, Index Properties | त्रिकलीय प्रणाली, कला संबंध, सूचकांक गुण
T classification | Unified and Indian Standard Soil Classification | एकीकृत और भारतीय मानक मृदा वर्गीकरण
T permeability | Permeability, Seepage, Uplift, Piping, Capillarity | पारगम्यता, रिसाव, उत्थान दाब, पाइपिंग, केशिकत्व
T effective_stress | Effective Stress and Quicksand Condition | प्रभावी प्रतिबल और चलरेत स्थिति
T compaction_consolidation | Compaction and One-dimensional Consolidation | संघनन और एक-आयामी समेकन
T shear_strength | Shear Strength, Mohr's Circle, Stress–Strain of Clays and Sand | अपरूपण सामर्थ्य, मोहर वृत्त, मृत्तिका और रेत का प्रतिबल–विकृति
C fluid_hydraulics | Fluid Mechanics and Hydraulics | तरल यांत्रिकी और द्रवचालिकी | -
T fluid_properties | Properties of Fluids, Fluid Statics | तरलों के गुण, तरल स्थैतिकी
T equations | Continuity, Momentum and Energy Equations | सांतत्य, संवेग और ऊर्जा समीकरण
T pipe_flow | Laminar and Turbulent Flow, Flow in Pipes, Pipe Networks | स्तरीय और विक्षुब्ध प्रवाह, पाइपों में प्रवाह, पाइप जाल
T lift_drag | Lift, Drag and Forces on Immersed Bodies | उत्थापक, कर्षण और डूबे पिंडों पर बल
T flow_measurement | Flow Measurement in Channels and Pipes | चैनलों और पाइपों में प्रवाह मापन
T channel_hydraulics | Channel Hydraulics: Specific Energy, Critical Flow, Hydraulic Jump, Uniform Flow | चैनल द्रवचालिकी: विशिष्ट ऊर्जा, क्रांतिक प्रवाह, द्रवचालित उछाल, समरूप प्रवाह
C hydrology_irrigation | Hydrology and Irrigation Engineering | जल विज्ञान और सिंचाई अभियांत्रिकी | -
T hydrologic_cycle | Hydrologic Cycle, Precipitation, Evaporation, Infiltration, Watershed | जल चक्र, वर्षण, वाष्पीकरण, अंतःस्यंदन, जलग्रहण क्षेत्र
T hydrographs | Unit Hydrographs, Flood Estimation and Routing, Reservoir Capacity | इकाई जलालेख, बाढ़ आकलन और अनुशीलन, जलाशय क्षमता
T groundwater | Groundwater Hydrology, Well Hydraulics, Darcy's Law | भूजल विज्ञान, कुआँ द्रवचालिकी, डार्सी का नियम
T irrigation_systems | Irrigation Systems, Crop Water Requirements (Duty, Delta) | सिंचाई प्रणालियाँ, फसल जल आवश्यकता (ड्यूटी, डेल्टा)
T dams_canals | Gravity Dams, Spillways, Lined and Unlined Canals, Cross Drainage | गुरुत्व बाँध, उत्प्लव मार्ग, आस्तरित और अनास्तरित नहरें, क्रॉस ड्रेनेज
C environmental | Environmental Engineering | पर्यावरण अभियांत्रिकी | -
T water_treatment | Water Quality, Requirement, Distribution and Drinking Water Treatment | जल गुणवत्ता, आवश्यकता, वितरण और पेयजल उपचार
T wastewater | Sewerage Design, Wastewater Treatment, Effluent Standards, Sludge, Reuse | सीवरेज डिज़ाइन, अपशिष्ट जल उपचार, बहिःस्राव मानक, गाद, पुनः उपयोग
T air_pollution | Air Pollutants, Control, Air Quality Standards and Index | वायु प्रदूषक, नियंत्रण, वायु गुणवत्ता मानक और सूचकांक
T solid_waste | Municipal Solid Waste Management | नगरपालिका ठोस अपशिष्ट प्रबंधन
C transportation | Transportation (Traffic) Engineering | परिवहन (यातायात) अभियांत्रिकी | -
T geometric_design | Geometric Design of Highways | राजमार्गों का ज्यामितीय डिज़ाइन
T pavements | Highway Materials and Flexible / Rigid Pavement Design (IRC) | राजमार्ग सामग्री और लचीले / कठोर फुटपाथ डिज़ाइन (IRC)
T traffic | Traffic Studies, Signs, Signal Design (Webster), Intersections, Capacity | यातायात अध्ययन, संकेत, सिग्नल डिज़ाइन (वेबस्टर), चौराहे, क्षमता
`;

// Part-B (Electrical), para 14.3.2
export const JE_ELECTRICAL = String.raw`
C fundamentals | Fundamentals of Electrical Engineering | विद्युत अभियांत्रिकी के मूल सिद्धांत | -
T circuit_elements | Circuit Elements: Resistors, Capacitors, Inductors, Batteries | परिपथ तत्व: प्रतिरोधक, संधारित्र, प्रेरक, बैटरी
T quantities_units | Voltage, Current, Power, Energy, Flux and their Units | वोल्टता, धारा, शक्ति, ऊर्जा, फ्लक्स और उनके मात्रक
T network_methods | Network Solution Methods: KCL, KVL, Node and Mesh Analysis | परिपथ हल विधियाँ: KCL, KVL, नोड और मेश विश्लेषण
T network_theorems | Network Theorems: Thevenin, Norton, Superposition, Maximum Power Transfer | परिपथ प्रमेय: थेवेनिन, नॉर्टन, अध्यारोपण, अधिकतम शक्ति स्थानांतरण
C magnetic_circuits | Magnetic Circuits | चुंबकीय परिपथ | -
T flux_reluctance | Flux, Reluctance, MMF, Self and Mutual Inductance | फ्लक्स, प्रतिष्टंभ, चुंबक वाहक बल, स्व और अन्योन्य प्रेरकत्व
C ac_fundamentals | A.C. Fundamentals | प्रत्यावर्ती धारा के मूल सिद्धांत | -
T rms_average | RMS and Average Values | RMS और औसत मान
T ac_circuits | Series and Parallel A.C. Circuits, Resonance | श्रेणी और समांतर AC परिपथ, अनुनाद
T three_phase | Balanced Three-phase Circuits, Star–Delta Transformation | संतुलित त्रि-कला परिपथ, स्टार–डेल्टा रूपांतरण
T power_factor | Complex Power and Power Factor | सम्मिश्र शक्ति और शक्ति गुणांक
C measurement | Measurement and Measuring Instruments | मापन और मापक यंत्र | -
T measuring_quantities | Measurement of Voltage, Current, Power and Power Factor | वोल्टता, धारा, शक्ति और शक्ति गुणांक का मापन
T instrument_errors | Classification of Instruments, Types of Errors | यंत्रों का वर्गीकरण, त्रुटियों के प्रकार
T meters_bridges | Galvanometer, Ammeter, Voltmeter, Wattmeter, Bridges, Energy Meter, Megger | धारामापी, एमीटर, वोल्टमीटर, वाटमीटर, ब्रिज, ऊर्जा मीटर, मेगर
T ct_pt | CT, PT and their Uses | CT, PT और उनके उपयोग
C machines | Electrical Machines | विद्युत मशीनें | -
T transformers | Single-phase and Three-phase Transformers | एकल-कला और त्रि-कला ट्रांसफ़ॉर्मर
T dc_machines | DC Machines: Types, Characteristics, Losses, Efficiency | DC मशीनें: प्रकार, अभिलक्षण, हानियाँ, दक्षता
T induction_motors | Induction Motors: Starting, Speed Control, Braking, Torque–Speed | प्रेरण मोटर: प्रवर्तन, गति नियंत्रण, ब्रेकिंग, बलाघूर्ण–गति
C special_machines | Special Electric Machines and Synchronous Generators | विशेष विद्युत मशीनें और तुल्यकालिक जनित्र | -
T fractional_servo | Fractional Motors and Servomotors | भिन्नात्मक मोटर और सर्वोमोटर
T synchronous | Armature Reaction, Parallel Operation, Synchronization | आर्मेचर प्रतिक्रिया, समांतर संचालन, तुल्यकालन
C power_systems | Generation, Transmission and Distribution | उत्पादन, पारेषण और वितरण | -
T power_stations | Power Stations, Load / Demand / Diversity Factor, Power Factor Improvement | विद्युत केंद्र, भार / माँग / विविधता गुणांक, शक्ति गुणांक सुधार
T lines | Transmission and Distribution Lines, Parameters, Corona and Ferranti Effect | पारेषण और वितरण लाइनें, प्राचल, कोरोना और फेरांटी प्रभाव
T protection | Circuit Breakers, Protection of Generators and Transformers | परिपथ वियोजक, जनित्र और ट्रांसफ़ॉर्मर की सुरक्षा
T cables | Coaxial Cables, Ratings and Efficiency | समाक्षीय केबल, रेटिंग और दक्षता
C estimation_costing | Estimation and Costing | प्राक्कलन और लागत निर्धारण | -
T lighting_installation | Lighting Schemes, Machine Installation, Earthing and IE Rules | प्रकाश योजनाएँ, मशीन स्थापना, भू-संपर्कन और IE नियम
C utilization | Utilization of Electrical Energy | विद्युत ऊर्जा का उपयोग | -
T utilization_topics | Illumination, Heating, Welding, Electroplating, Traction and Drives | प्रदीपन, तापन, वेल्डिंग, विद्युत लेपन, कर्षण और ड्राइव
C basic_electronics | Basic Electronics | मूल इलेक्ट्रॉनिकी | -
T diodes | P-N Junction Diodes, Rectifiers, Wave-shapers, Clipping, Clamping | P-N संधि डायोड, दिष्टकारी, तरंग-आकारक, क्लिपिंग, क्लैंपिंग
T transistors | BJT and FET, Characteristics, Amplifiers, Oscillators | BJT और FET, अभिलक्षण, प्रवर्धक, दोलित्र
C power_electronics | Power Electronics | शक्ति इलेक्ट्रॉनिकी | -
T thyristor | Thyristor V-I Characteristics, Firing and Gating Circuits | थाइरिस्टर V-I अभिलक्षण, फायरिंग और गेटिंग परिपथ
T dc_dc | DC–DC Conversion: Buck, Boost, Buck-Boost | DC–DC रूपांतरण: बक, बूस्ट, बक-बूस्ट
T rectifiers | Half-controlled, Full-controlled and Midpoint Rectifiers | अर्ध-नियंत्रित, पूर्ण-नियंत्रित और मध्यबिंदु दिष्टकारी
`;

// Part-C (Mechanical), para 14.3.3
export const JE_MECHANICAL = String.raw`
C engineering_mechanics | Engineering Mechanics | अभियांत्रिकी यांत्रिकी | -
T equilibrium | Free Body Diagrams, Equilibrium, Resultant of Forces, Lami's Theorem | मुक्त पिंड आरेख, संतुलन, बलों का परिणामी, लामी प्रमेय
T friction | Laws of Friction, Sliding and Rolling Friction | घर्षण के नियम, सर्पी और लोटनिक घर्षण
T centroid | Centroid of Plane Figures, Centre of Gravity of Simple Solids | समतल आकृतियों का केंद्रक, सरल ठोसों का गुरुत्व केंद्र
C strength_materials | Strength of Materials | पदार्थ सामर्थ्य | -
T stress_strain | Simple Stress and Strain | सरल प्रतिबल और विकृति
T beams | Types of Beams, Shear Force and Bending Moment, Bending and Deflection | धरनों के प्रकार, अपरूपण बल और बंकन आघूर्ण, बंकन और विक्षेप
T torsion_shells | Torsion of Shafts, Thin Cylindrical Shells | शाफ़्ट का ऐंठन, पतले बेलनाकार कोश
C theory_machines | Theory of Machines | मशीनों का सिद्धांत | -
T cams_drives | Cams and Follower, Belt, Chain, Rope, Gear Drives, Gear Trains | कैम और अनुगामी, पट्टा, शृंखला, रस्सी, गियर चालन, गियर ट्रेन
T flywheel_governors | Flywheels and Governors | गतिपालक चक्र और नियंत्रक
T balancing_vibration | Balancing and Vibration | संतुलन और कंपन
T brakes_clutches | Brakes, Dynamometers, Clutches, Bearings | ब्रेक, डायनेमोमीटर, क्लच, बेयरिंग
C machine_design | Machine Design | मशीन डिज़ाइन | -
T loads_failure | Loads and Stresses, Creep and Fatigue, Theories of Failure | भार और प्रतिबल, विसर्पण और श्रांति, विफलता के सिद्धांत
T joints | Cotter Joint, Knuckle Joint, Lever and Crank | कॉटर जोड़, नकल जोड़, उत्तोलक और क्रैंक
T elements | Keys, Shafts, Couplings, Spur Gear, Power Screw, Springs, Bearings | की, शाफ़्ट, युग्मन, स्पर गियर, शक्ति पेंच, स्प्रिंग, बेयरिंग
T fasteners | Screw Fasteners, Bolted and Welded Joints | पेंच बंधक, बोल्ट युक्त और वेल्डेड जोड़
C materials | Materials Science and Engineering | पदार्थ विज्ञान और अभियांत्रिकी | -
T crystal | Crystal Structure and Bonds | क्रिस्टल संरचना और बंध
T iron_carbon | Iron–Carbon Phase Diagram, Heat Treatment of Steel | लोहा–कार्बन कला आरेख, इस्पात का ऊष्मा उपचार
T alloys | Cast Iron, Steels and Major Non-ferrous Alloys | ढलवाँ लोहा, इस्पात और प्रमुख अलौह मिश्रधातु
T testing | Material Properties, Testing, Non-destructive Testing, Corrosion | पदार्थ गुण, परीक्षण, अविनाशी परीक्षण, संक्षारण
C thermal | Thermal Engineering | ऊष्मीय अभियांत्रिकी | -
T thermodynamics | Sources of Energy, Laws of Thermodynamics, Heat Engine, Heat Pump, Refrigerator | ऊर्जा स्रोत, ऊष्मागतिकी के नियम, ऊष्मा इंजन, ऊष्मा पंप, प्रशीतक
T steam | Steam Generators, Properties of Steam, Steam Turbines, Steam Nozzle, Cooling Tower | भाप जनित्र, भाप के गुण, भाप टरबाइन, भाप नोज़ल, शीतलन टावर
T power_plant | Thermal Power Plant | ऊष्मीय विद्युत संयंत्र
T ic_engines | IC Engines: Otto, Diesel, Dual Cycles, Types | IC इंजन: ओटो, डीज़ल, द्वैत चक्र, प्रकार
T compressors_refrigeration | Air Compressor, Refrigeration and Air Conditioning | वायु संपीडक, प्रशीतन और वातानुकूलन
T gas_turbine | Gas Turbine and Jet Propulsion | गैस टरबाइन और जेट प्रणोदन
T heat_transfer | Heat Transfer and Heat Exchangers | ऊष्मा स्थानांतरण और ऊष्मा विनिमयक
C fluid_machinery | Fluid Mechanics and Hydraulic Machinery | तरल यांत्रिकी और द्रवचालित मशीनरी | -
T fluid_flow | Properties of Fluid, Fluid Flow, Continuity, Flow through Pipes | तरल के गुण, तरल प्रवाह, सांतत्य, पाइपों में प्रवाह
T jets | Impact of Jets on Plates and Vanes | प्लेटों और फलकों पर जेट का प्रभाव
T turbines_pumps | Hydraulic Turbines, Power Plant, Centrifugal and Reciprocating Pumps | द्रवचालित टरबाइन, विद्युत संयंत्र, अपकेंद्री और प्रत्यागामी पंप
C industrial | Industrial Engineering | औद्योगिक अभियांत्रिकी | -
T plant_layout | Site Selection and Plant Layout | स्थल चयन और संयंत्र अभिन्यास
T work_study | Work Study and Work Measurement | कार्य अध्ययन और कार्य मापन
T ppc_quality | Production Planning and Control, Statistical Quality Control | उत्पादन योजना और नियंत्रण, सांख्यिकीय गुणवत्ता नियंत्रण
T inventory | Inventory Control | माल-सूची नियंत्रण
C manufacturing | Manufacturing Engineering | विनिर्माण अभियांत्रिकी | -
T casting | Pattern Making, Moulding, Casting | प्रतिरूप निर्माण, साँचा बनाना, ढलाई
T forming_welding | Metal Forming and Welding (Gas, Arc, Resistance) | धातु रूपण और वेल्डिंग (गैस, आर्क, प्रतिरोध)
T machining | Lathe, Broaching, Drilling, Milling, Gear Making, Grinding, Press Working | खराद, ब्रोचिंग, ड्रिलिंग, मिलिंग, गियर निर्माण, घर्षण, प्रेस कार्य
C metrology | Metrology and Measurement | मापिकी और मापन | -
T measurement_terms | Precision, Accuracy, Sensitivity, Repeatability, Calibration | परिशुद्धता, यथार्थता, संवेदनशीलता, पुनरावृत्तिता, अंशांकन
T linear_angular | Linear and Angular Measurement, Comparators, Surface Finish, CMM | रैखिक और कोणीय मापन, तुलनित्र, सतह परिष्करण, CMM
T fits | Limits, Fits, Tolerances and Interchangeability | सीमाएँ, अन्वायोजन, सहनशीलता और विनिमेयता
C advanced_manufacturing | Advanced Manufacturing Processes | उन्नत विनिर्माण प्रक्रियाएँ | -
T jigs_cnc | Jigs and Fixtures, CNC Milling and Machining Centre, PLC | जिग और फ़िक्स्चर, CNC मिलिंग और मशीनिंग केंद्र, PLC
T non_traditional | Special Purpose Machines, Non-traditional Machining (EDM, ECM, AJM, LBM, EBM) | विशेष प्रयोजन मशीनें, अपारंपरिक मशीनिंग (EDM, ECM, AJM, LBM, EBM)
T cad_cam | CAD/CAM, Industrial Robots and FMS | CAD/CAM, औद्योगिक रोबोट और FMS
`;
