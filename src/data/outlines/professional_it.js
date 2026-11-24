// Curated outline — Professional Knowledge (IT).  STATUS: DRAFT (not served).
//
// Exam: IBPS SO (IT Officer), Mains "Professional Knowledge" (verify per
// notification). One chapter per existing learning unit of
// `professional_it` (syllabus.js topicUnits) — chapter.topicId is the unit
// id, so nothing is duplicated.

const ch = (topicId, title, sections, weight = 'high') => ({
  id: topicId.split('.').slice(1).join('_'),
  topicId,
  title,
  weight,
  sections: sections.map(([id, t, origin]) => ({ id, title: t, ...(origin ? { origin } : {}) })),
});

export const professionalItOutline = {
  id: 'professional_it',
  status: 'draft',
  version: 1,
  origin: 'curated',
  title: 'Professional Knowledge (IT)',
  chapters: [
    // Data Structures
    ch('professional_it.data_structures.basics_complexity', 'Basics & Time Complexity', [
      ['adt', 'Data types, ADTs and classification of data structures'],
      ['asymptotic', 'Asymptotic notation: Big-O, Omega, Theta'],
      ['analysis', 'Analysing loops and recursion; best, average, worst case'],
    ]),
    ch('professional_it.data_structures.arrays_strings', 'Arrays & Strings', [
      ['arrays', 'One- and multi-dimensional arrays, row/column-major address calculation'],
      ['operations', 'Array operations and their complexity'],
      ['strings', 'String representation and common string operations'],
    ]),
    ch('professional_it.data_structures.linked_lists', 'Linked Lists', [
      ['singly', 'Singly linked lists: insertion, deletion, traversal'],
      ['doubly_circular', 'Doubly and circular linked lists'],
      ['applications', 'Applications and comparison with arrays'],
    ]),
    ch('professional_it.data_structures.stacks_queues', 'Stacks & Queues', [
      ['stack', 'Stack operations and implementations'],
      ['expressions', 'Infix, prefix, postfix conversion and evaluation'],
      ['queues', 'Queue, circular queue, deque and priority queue'],
    ]),
    ch('professional_it.data_structures.trees_bst', 'Trees & Binary Search Trees', [
      ['terminology', 'Tree terminology and binary tree properties'],
      ['traversals', 'Traversals: inorder, preorder, postorder, level order'],
      ['bst', 'Binary search tree operations'],
      ['balanced', 'AVL trees and B-trees / B+ trees'],
    ]),
    ch('professional_it.data_structures.heaps', 'Heaps & Priority Queues', [
      ['heap', 'Binary heap: heapify, insert, delete'],
      ['heapsort', 'Heap sort and priority queue applications'],
    ], 'medium'),
    ch('professional_it.data_structures.graphs', 'Graphs & Traversals', [
      ['representation', 'Graph terminology and representations'],
      ['bfs_dfs', 'BFS and DFS'],
      ['shortest_mst', "Shortest paths (Dijkstra) and minimum spanning trees (Prim, Kruskal)"],
    ]),
    ch('professional_it.data_structures.hashing', 'Hashing', [
      ['functions', 'Hash functions and hash tables'],
      ['collisions', 'Collision resolution: chaining and open addressing'],
    ], 'medium'),
    ch('professional_it.data_structures.sorting_searching', 'Sorting & Searching', [
      ['searching', 'Linear and binary search'],
      ['simple_sorts', 'Bubble, selection and insertion sort'],
      ['efficient_sorts', 'Merge sort, quick sort and their complexity'],
      ['comparison', 'Comparison of sorting algorithms (stability, in-place, complexity)'],
    ]),
    // DBMS
    ch('professional_it.dbms.basics_architecture', 'DBMS Basics & Architecture', [
      ['intro', 'DBMS vs file system, advantages, users'],
      ['architecture', 'Three-schema architecture and data independence'],
      ['models', 'Data models: hierarchical, network, relational'],
    ]),
    ch('professional_it.dbms.er_model', 'ER Model', [
      ['entities', 'Entities, attributes and relationships'],
      ['cardinality', 'Cardinality, participation, weak entities'],
      ['er_to_tables', 'Converting ER diagrams to tables'],
    ]),
    ch('professional_it.dbms.relational_model', 'Relational Model & Keys', [
      ['keys', 'Super, candidate, primary, foreign and alternate keys'],
      ['integrity', 'Integrity constraints'],
      ['algebra', 'Relational algebra'],
    ]),
    ch('professional_it.dbms.sql', 'SQL', [
      ['ddl_dml', 'DDL, DML, DCL and TCL commands'],
      ['queries', 'SELECT, joins, GROUP BY, HAVING, subqueries'],
      ['views_triggers', 'Views, indexes, triggers and stored procedures'],
    ]),
    ch('professional_it.dbms.normalization', 'Normalization', [
      ['fd', 'Functional dependencies and anomalies'],
      ['normal_forms', '1NF, 2NF, 3NF and BCNF'],
      ['higher', 'Higher normal forms and denormalization', 'recommended'],
    ]),
    ch('professional_it.dbms.transactions', 'Transactions & Concurrency', [
      ['acid', 'Transactions and ACID properties'],
      ['schedules', 'Schedules and serializability'],
      ['concurrency', 'Locking, two-phase locking, deadlocks'],
      ['recovery', 'Recovery: logs, checkpoints'],
    ]),
    ch('professional_it.dbms.indexing', 'Indexing & File Organization', [
      ['files', 'File organization methods'],
      ['indexes', 'Primary, secondary, clustered indexes; B+ tree indexes'],
    ], 'medium'),
    // Computer Networks
    ch('professional_it.networking.osi_tcpip', 'OSI & TCP/IP Models', [
      ['osi', 'OSI layers and their functions'],
      ['tcpip', 'TCP/IP model and comparison with OSI'],
    ]),
    ch('professional_it.networking.physical_datalink', 'Physical & Data Link Layer', [
      ['media', 'Transmission media, encoding and multiplexing'],
      ['error_control', 'Framing, error detection and correction'],
      ['mac', 'Flow control, MAC protocols, Ethernet'],
    ]),
    ch('professional_it.networking.network_layer', 'Network Layer & IP Addressing', [
      ['ipv4', 'IPv4 addressing, classes and subnetting'],
      ['ipv6', 'IPv6 basics'],
      ['routing', 'Routing algorithms and protocols'],
    ]),
    ch('professional_it.networking.transport_layer', 'Transport Layer (TCP & UDP)', [
      ['tcp', 'TCP: connection setup, flow and congestion control'],
      ['udp_ports', 'UDP and port numbers'],
    ]),
    ch('professional_it.networking.application_layer', 'Application Layer Protocols', [
      ['web_mail', 'HTTP, DNS, SMTP, POP3, IMAP'],
      ['others', 'FTP, DHCP, SNMP, Telnet, SSH'],
    ]),
    ch('professional_it.networking.devices_topologies', 'Network Devices & Topologies', [
      ['devices', 'Hub, switch, router, bridge, gateway'],
      ['topologies', 'Topologies and network types (LAN, MAN, WAN)'],
    ], 'medium'),
    // Operating System
    ch('professional_it.operating_system.basics_types', 'OS Basics & Types', [
      ['functions', 'OS functions and structure; system calls'],
      ['types', 'Batch, time-sharing, real-time, distributed OS'],
    ]),
    ch('professional_it.operating_system.processes_threads', 'Processes & Threads', [
      ['process', 'Process states and PCB'],
      ['threads', 'Threads and multithreading models'],
      ['ipc', 'Inter-process communication'],
    ]),
    ch('professional_it.operating_system.cpu_scheduling', 'CPU Scheduling', [
      ['criteria', 'Scheduling criteria'],
      ['algorithms', 'FCFS, SJF, priority, round robin, multilevel queue'],
      ['problems', 'Solved scheduling problems (waiting and turnaround time)'],
    ]),
    ch('professional_it.operating_system.synchronization_deadlock', 'Synchronization & Deadlocks', [
      ['critical_section', 'Critical section problem, semaphores, mutex'],
      ['classic', 'Classic problems: producer–consumer, readers–writers, dining philosophers'],
      ['deadlock', "Deadlock conditions, prevention, avoidance (Banker's algorithm), detection"],
    ]),
    ch('professional_it.operating_system.memory_management', 'Memory Management & Paging', [
      ['allocation', 'Contiguous allocation and fragmentation'],
      ['paging', 'Paging and segmentation'],
      ['virtual', 'Virtual memory and page replacement algorithms'],
    ]),
    ch('professional_it.operating_system.file_systems', 'File Systems & Disk Scheduling', [
      ['files', 'File systems, directories and allocation methods'],
      ['disk', 'Disk scheduling algorithms and RAID'],
    ], 'medium'),
    // Software Engineering
    ch('professional_it.software_engineering.sdlc_models', 'SDLC Models', [
      ['sdlc', 'SDLC phases'],
      ['models', 'Waterfall, spiral, prototype, incremental, Agile and Scrum'],
    ]),
    ch('professional_it.software_engineering.requirements', 'Requirements Engineering', [
      ['srs', 'Requirement types and the SRS'],
      ['modelling', 'Use cases, DFDs and feasibility study'],
    ], 'medium'),
    ch('professional_it.software_engineering.design', 'Software Design', [
      ['principles', 'Cohesion, coupling and modularity'],
      ['uml', 'UML diagrams'],
    ], 'medium'),
    ch('professional_it.software_engineering.testing', 'Software Testing', [
      ['levels', 'Testing levels: unit, integration, system, acceptance'],
      ['techniques', 'Black-box and white-box techniques'],
    ]),
    ch('professional_it.software_engineering.maintenance_metrics', 'Maintenance & Metrics', [
      ['maintenance', 'Types of maintenance'],
      ['metrics', 'Software metrics, COCOMO and estimation'],
    ], 'medium'),
    // Web Technology
    ch('professional_it.web_technology.html_css', 'HTML & CSS', [
      ['html', 'HTML structure, tags, forms, HTML5 features'],
      ['css', 'CSS selectors, box model, layout'],
    ]),
    ch('professional_it.web_technology.javascript', 'JavaScript Basics', [
      ['basics', 'JavaScript syntax, DOM and events'],
      ['async', 'AJAX and asynchronous requests'],
    ], 'medium'),
    ch('professional_it.web_technology.http_web', 'HTTP & How the Web Works', [
      ['http', 'HTTP methods, status codes, cookies and sessions'],
      ['web', 'URLs, web servers, browsers and HTTPS'],
    ]),
    ch('professional_it.web_technology.server_side', 'Server-side & Databases', [
      ['server', 'Server-side scripting and web application architecture'],
      ['services', 'Web services: REST and SOAP'],
    ], 'medium'),
    ch('professional_it.web_technology.xml_json', 'XML & JSON', [
      ['xml', 'XML, DTD and schema'],
      ['json', 'JSON and comparison with XML'],
    ], 'medium'),
    // Information Security
    ch('professional_it.security.basics_threats', 'Security Basics & Threats', [
      ['cia', 'CIA triad and security goals'],
      ['threats', 'Threats, vulnerabilities and risk'],
    ]),
    ch('professional_it.security.cryptography', 'Cryptography', [
      ['symmetric', 'Symmetric encryption: DES, AES'],
      ['asymmetric', 'Public-key encryption: RSA, Diffie–Hellman'],
      ['hash_signatures', 'Hash functions, digital signatures, certificates and PKI'],
    ]),
    ch('professional_it.security.network_security', 'Network Security & Firewalls', [
      ['firewalls', 'Firewalls, IDS and IPS'],
      ['protocols', 'VPN, SSL/TLS and IPSec'],
    ]),
    ch('professional_it.security.authentication', 'Authentication & Access Control', [
      ['auth', 'Authentication methods and multi-factor authentication'],
      ['access', 'Access control models'],
    ], 'medium'),
    ch('professional_it.security.malware_attacks', 'Malware & Common Attacks', [
      ['malware', 'Viruses, worms, trojans, ransomware'],
      ['attacks', 'Phishing, DoS/DDoS, SQL injection, XSS, man-in-the-middle'],
    ]),
  ],
};
