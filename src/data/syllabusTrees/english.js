/**
 * English Language — shared concept library (SSC and others). Format: see
 * engine.js. Ids: en.<chapter>.<topic>[.<micro>]. Exam availability and
 * official status: ./sscExams.js (only headings named by a notification are
 * official; the breakdown below them is supplementary/draft).
 */
export const ENGLISH = String.raw`
C vocabulary | Vocabulary | शब्दावली | english.synonyms
T synonyms | Synonyms | पर्यायवाची
M synonym_word | Word Synonyms | शब्द के पर्यायवाची
M synonym_context | Synonyms in Context | संदर्भ में पर्यायवाची
T antonyms | Antonyms | विलोम
M antonym_word | Word Antonyms | शब्द के विलोम
M antonym_context | Antonyms in Context | संदर्भ में विलोम
T one_word | One Word Substitution | एक शब्द प्रतिस्थापन
M one_word_sub | One Word for a Phrase | वाक्यांश के लिए एक शब्द
T idioms | Idioms and Phrases | मुहावरे और वाक्यांश
M idiom_meaning | Meaning of Idioms and Phrases | मुहावरों और वाक्यांशों का अर्थ
T spelling | Spelling | वर्तनी
M spelling_correct | Correctly / Incorrectly Spelt Words | सही / गलत वर्तनी वाले शब्द
T usage | Word Usage | शब्द प्रयोग
M homonyms | Homonyms and Confusable Words | समानध्वनि और भ्रमित करने वाले शब्द
M collocations | Collocations | सहप्रयोग

C grammar | Grammar | व्याकरण | english.error_spotting
T error_detection | Error Detection (Spot the Error) | त्रुटि पहचान
M subject_verb | Subject–Verb Agreement | कर्ता–क्रिया सामंजस्य
M tenses | Tenses | काल
M articles | Articles | आर्टिकल
M prepositions | Prepositions | पूर्वसर्ग
M pronouns | Pronouns | सर्वनाम
M adjectives_adverbs | Adjectives and Adverbs | विशेषण और क्रियाविशेषण
M conjunctions | Conjunctions | संयोजक
M modals | Modals | सहायक क्रियाएँ (मोडल)
M nouns | Nouns | संज्ञा
T sentence_improvement | Sentence Improvement | वाक्य सुधार
M improve_phrase | Improve the Underlined Part | रेखांकित भाग में सुधार
T fill_blanks | Fill in the Blanks | रिक्त स्थान भरें
M grammar_blank | Grammar-based Blank | व्याकरण आधारित रिक्त स्थान
M vocabulary_blank | Vocabulary-based Blank | शब्दावली आधारित रिक्त स्थान
T voice | Active and Passive Voice | कर्तृवाच्य और कर्मवाच्य
M voice_change | Voice Conversion | वाच्य परिवर्तन
T narration | Direct and Indirect Speech | प्रत्यक्ष और अप्रत्यक्ष कथन
M narration_change | Narration Conversion | कथन परिवर्तन

C sentence_structure | Sentence Structure | वाक्य संरचना | english.para_jumbles
T rearrangement | Sentence Rearrangement (Para Jumbles) | वाक्य पुनर्व्यवस्था
M para_jumble | Arrange Sentences in a Paragraph | अनुच्छेद में वाक्य व्यवस्था
M parts_jumble | Arrange Parts of a Sentence | वाक्य के भागों की व्यवस्था
T completion | Sentence Completion | वाक्य पूर्ति
M complete_sentence | Complete the Sentence | वाक्य पूर्ण करें

C comprehension | Comprehension | बोधगम्यता | english.reading_comprehension
T reading | Reading Comprehension | पठन बोध
M main_idea | Main Idea and Title | मुख्य विचार और शीर्षक
M detail | Factual / Detail Questions | तथ्यात्मक प्रश्न
M inference | Inference and Tone | अनुमान और स्वर
M vocab_in_passage | Vocabulary in the Passage | गद्यांश में शब्दावली
T cloze | Cloze Test | क्लोज़ टेस्ट
M cloze_passage | Cloze Passage | क्लोज़ गद्यांश
`;
