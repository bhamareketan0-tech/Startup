import type { Question } from "./supabase";

const CH = "breathing-and-exchange-of-gases";
const CL = "11";
const SUB = "Biology";

let _n = 1;
const mk = (
  subunit: string,
  type: string,
  question: string,
  o1: string,
  o2: string,
  o3: string,
  o4: string,
  correct: "option1" | "option2" | "option3" | "option4",
  meta?: Record<string, unknown>
): Question => ({
  id: `ch14-mock-${_n++}`,
  subject: SUB,
  chapter: CH,
  class: CL,
  subunit,
  type,
  question,
  option1: o1,
  option2: o2,
  option3: o3,
  option4: o4,
  correct,
  explanation: "",
  difficulty: "medium",
  is_active: true,
  created_at: new Date().toISOString(),
  meta: meta ?? null,
});

const para = (subunit: string, question: string, highlights: string[]): Question =>
  mk(subunit, "paragraph", question, "", "", "", "", "option1", { highlights });

const ptr = (subunit: string, question: string, bullets: string[]): Question =>
  mk(subunit, "pointer_notes", question, "", "", "", "", "option1", { bullets });

const mcq = (
  subunit: string,
  question: string,
  o1: string,
  o2: string,
  o3: string,
  o4: string,
  correct: "option1" | "option2" | "option3" | "option4"
): Question => mk(subunit, "mcq", question, o1, o2, o3, o4, correct);

const ar = (
  subunit: string,
  assertion: string,
  reason: string,
  correct: "option1" | "option2" | "option3" | "option4"
): Question =>
  mk(
    subunit,
    "assertion",
    assertion,
    "Both true — R explains A",
    "Both true — R does NOT explain A",
    "A true, R false",
    "A false, R true",
    correct,
    { statementR: reason }
  );

const ncs = (
  subunit: string,
  question: string,
  statements: string[],
  correct: "option1" | "option2" | "option3" | "option4"
): Question =>
  mk(subunit, "statements", question, "Only 1", "Only 2", "Only 3", "All 4", correct, {
    statements,
  });

const mtc = (
  subunit: string,
  question: string,
  colLeft: string[],
  colRight: string[],
  o1: string,
  o2: string,
  o3: string,
  o4: string,
  correct: "option1" | "option2" | "option3" | "option4"
): Question =>
  mk(subunit, "match", question, o1, o2, o3, o4, correct, { colLeft, colRight });

const fitb = (
  subunit: string,
  question: string,
  o1: string,
  o2: string,
  o3: string,
  o4: string,
  correct: "option1" | "option2" | "option3" | "option4"
): Question => mk(subunit, "fillblanks", question, o1, o2, o3, o4, correct);

const tf4 = (
  subunit: string,
  question: string,
  o1: string,
  o2: string,
  o3: string,
  o4: string,
  correct: "option1" | "option2" | "option3" | "option4"
): Question => mk(subunit, "mcq", question, o1, o2, o3, o4, correct);

export const mockQuestions: Question[] = [

  // ═══════════════════════════════════════════════
  //  INTRODUCTION
  // ═══════════════════════════════════════════════

  para(
    "Introduction",
    "O2 is utilised by organisms to indirectly break down simple molecules like glucose, amino acids, fatty acids, etc., to derive energy to perform various activities. Carbon dioxide (CO2) which is harmful is also released during the above catabolic reactions. It is, therefore, evident that O2 has to be continuously provided to the cells and CO2 produced by the cells have to be released out. This process of exchange of O2 from the atmosphere with CO2 produced by the cells is called breathing, commonly known as respiration. Place your hands on your chest; you can feel the chest moving up and down. This is due to breathing.",
    ["breathing", "respiration", "O2", "CO2", "catabolic reactions", "glucose", "amino acids", "fatty acids"]
  ),

  ptr("Introduction", "Introduction to Breathing — Key Points", [
    "O2 utilisation: Used to indirectly break down glucose, amino acids, fatty acids to derive energy.",
    "CO2: Harmful gas released during catabolic reactions.",
    "O2 supply: Must be continuously provided to cells.",
    "CO2 removal: Must be released out from cells.",
    "Breathing: Exchange of O2 from atmosphere with CO2 from cells.",
    "Respiration: Common name for breathing.",
    "Physical sign: Chest moving up and down — due to breathing.",
    "What follows: Respiratory organs and mechanism of breathing in following sections.",
  ]),

  // MCQ
  mcq("Introduction", "O2 is utilised by organisms to break down simple molecules:", "Directly", "Indirectly", "Both directly and indirectly", "Never", "option2"),
  mcq("Introduction", "Which is NOT a simple molecule broken down by organisms?", "Glucose", "Amino acids", "Fatty acids", "DNA", "option4"),
  mcq("Introduction", "Organisms break down simple molecules to:", "Produce CO2", "Produce O2", "Store water", "Derive energy", "option4"),
  mcq("Introduction", "CO2 released during catabolic reactions is:", "Useful", "Neutral", "Harmful", "Energetic", "option3"),
  mcq("Introduction", "O2 must be provided to cells:", "Occasionally", "Continuously", "Weekly", "Only during exercise", "option2"),
  mcq("Introduction", "CO2 produced by cells must be:", "Stored in cells", "Released out", "Converted to O2", "Kept in blood", "option2"),
  mcq("Introduction", "Exchange of O2 with CO2 from cells is called:", "Digestion", "Circulation", "Breathing", "Excretion", "option3"),
  mcq("Introduction", "Breathing is commonly known as:", "Digestion", "Excretion", "Circulation", "Respiration", "option4"),
  mcq("Introduction", "Physical sign confirming breathing:", "Blinking of eyes", "Movement of fingers", "Chest moving up and down", "Movement of legs", "option3"),
  mcq("Introduction", "Simple molecules broken down by organisms include:", "Glucose, amino acids, fatty acids", "Proteins, lipids, nucleic acids", "Vitamins, minerals, water", "Starch, cellulose, glycogen", "option1"),
  mcq("Introduction", "Which gas must be continuously provided to cells?", "CO2", "N2", "O2", "H2O", "option3"),
  mcq("Introduction", "Respiratory organs are described in:", "Previous chapters", "Following sections of chapter", "Summary only", "Exercises only", "option2"),

  // Match
  mtc(
    "Introduction", "Match the following:",
    ["O2", "CO2", "Glucose", "Breathing"],
    ["P. Harmful gas released during catabolism", "Q. Simple molecule broken down for energy", "R. Exchange of gases between atmosphere and cells", "S. Gas continuously provided to cells"],
    "1-S, 2-P, 3-Q, 4-R", "1-P, 2-S, 3-R, 4-Q", "1-Q, 2-R, 3-P, 4-S", "1-R, 2-Q, 3-S, 4-P", "option1"
  ),
  mtc(
    "Introduction", "Match the following:",
    ["Catabolic reactions", "Respiration", "Chest movement", "Respiratory organs"],
    ["P. Common name for breathing", "Q. Described in following sections", "R. Felt by placing hands on chest", "S. Releases CO2 as by-product"],
    "1-S, 2-P, 3-R, 4-Q", "1-P, 2-Q, 3-S, 4-R", "1-R, 2-S, 3-Q, 4-P", "1-Q, 2-R, 3-P, 4-S", "option1"
  ),
  mtc(
    "Introduction", "Match the following:",
    ["O2", "CO2", "Breathing", "Derive energy"],
    ["P. Must be released out from cells", "Q. Must be continuously provided to cells", "R. Exchange of atmospheric O2 with CO2", "S. Purpose of breaking down simple molecules"],
    "1-Q, 2-P, 3-R, 4-S", "1-P, 2-Q, 3-S, 4-R", "1-S, 2-R, 3-Q, 4-P", "1-R, 2-S, 3-P, 4-Q", "option1"
  ),

  // Assertion-Reason
  ar("Introduction", "O2 is continuously provided to the cells.", "O2 is used by organisms to break down simple molecules and derive energy.", "option1"),
  ar("Introduction", "CO2 is released during catabolic reactions.", "CO2 is useful for cells and stored inside them.", "option3"),
  ar("Introduction", "The process of breathing is also called respiration.", "Breathing involves exchange of O2 from atmosphere with CO2 from cells.", "option2"),
  ar("Introduction", "Chest moves up and down during breathing.", "Breathing causes direct exchange of gases through the chest wall.", "option3"),
  ar("Introduction", "Organisms derive energy by breaking down simple molecules.", "O2 is used indirectly in the breakdown of simple molecules.", "option1"),
  ar("Introduction", "CO2 produced by cells must be released out.", "CO2 is harmful if it accumulates inside cells.", "option1"),
  ar("Introduction", "Glucose is broken down by organisms.", "Glucose is a simple molecule used as a source of energy.", "option2"),
  ar("Introduction", "Breathing is commonly known as respiration.", "Respiration involves exchange of O2 from atmosphere with CO2 from cells.", "option1"),

  // NCS
  ncs("Introduction", "How many of the following statements are CORRECT?", ["O2 is used indirectly to break down simple molecules.", "CO2 is a useful gas produced during catabolic reactions.", "Breathing is commonly known as respiration.", "O2 must be continuously provided to cells."], "option3"),
  ncs("Introduction", "How many of the following statements are CORRECT?", ["Glucose, amino acids and fatty acids are complex molecules.", "CO2 produced by cells must be released out.", "Chest moves up and down during breathing.", "Breathing involves exchange of O2 and CO2."], "option3"),
  ncs("Introduction", "How many of the following statements are CORRECT?", ["CO2 is released during catabolic reactions.", "O2 is used directly to break down simple molecules.", "Breathing is also called respiration.", "Respiratory organs are described later in the chapter."], "option3"),
  ncs("Introduction", "How many of the following statements are CORRECT?", ["Exchange of gases between atmosphere and cells is called breathing.", "CO2 is harmful when it accumulates in cells.", "Organisms derive energy by breaking down simple molecules.", "Fatty acids are not broken down by organisms."], "option3"),
  ncs("Introduction", "How many of the following statements are CORRECT?", ["O2 is continuously provided to the cells.", "CO2 must be stored in the cells.", "Glucose is a simple molecule broken down for energy.", "Amino acids are simple molecules broken down by organisms."], "option3"),
  ncs("Introduction", "How many of the following statements are CORRECT?", ["Breathing is the exchange of O2 with CO2.", "CO2 is useful and stored in the cells.", "Respiratory organs are described in following sections.", "Chest movement is due to breathing."], "option3"),

  // True/False (combo — as MCQ)
  tf4("Introduction", "Identify whether each statement is True (T) or False (F):\n(i) O2 used indirectly to break down molecules.\n(ii) CO2 is useful for cells.\n(iii) Breathing is commonly known as respiration.\n(iv) O2 must be continuously provided to cells.", "i-T, ii-T, iii-T, iv-T", "i-T, ii-F, iii-T, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-F, iv-T", "option2"),
  tf4("Introduction", "Identify whether each statement is True (T) or False (F):\n(i) Glucose is a complex molecule.\n(ii) CO2 produced by cells must be released out.\n(iii) Chest moves up and down due to breathing.\n(iv) Respiration is another name for digestion.", "i-T, ii-T, iii-T, iv-F", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-F, ii-F, iii-F, iv-T", "option2"),
  tf4("Introduction", "Identify whether each statement is True (T) or False (F):\n(i) CO2 is harmful when it accumulates in cells.\n(ii) O2 is used directly in catabolic reactions.\n(iii) Exchange of O2 with CO2 is called breathing.\n(iv) Amino acids are broken down by organisms for energy.", "i-T, ii-F, iii-T, iv-T", "i-F, ii-T, iii-T, iv-T", "i-T, ii-T, iii-F, iv-T", "i-T, ii-F, iii-F, iv-F", "option1"),
  tf4("Introduction", "Identify whether each statement is True (T) or False (F):\n(i) Respiratory organs described in following sections.\n(ii) Fatty acids not broken down by organisms.\n(iii) O2 must be continuously removed from cells.\n(iv) Breathing causes chest to move up and down.", "i-T, ii-F, iii-F, iv-T", "i-T, ii-T, iii-T, iv-F", "i-F, ii-T, iii-F, iv-T", "i-T, ii-F, iii-T, iv-T", "option1"),
  tf4("Introduction", "Identify whether each statement is True (T) or False (F):\n(i) CO2 produced during catabolic reactions.\n(ii) Breathing commonly called excretion.\n(iii) Organisms break down molecules to derive energy.\n(iv) CO2 from cells must be continuously provided.", "i-T, ii-F, iii-T, iv-F", "i-F, ii-T, iii-F, iv-T", "i-T, ii-T, iii-T, iv-F", "i-F, ii-F, iii-T, iv-T", "option1"),

  // Fill in the Blanks
  fitb("Introduction", "O2 is utilised by organisms to __________ break down simple molecules.", "directly", "indirectly", "slowly", "rapidly", "option2"),
  fitb("Introduction", "Simple molecules include glucose, __________ and fatty acids.", "starch", "amino acids", "vitamins", "minerals", "option2"),
  fitb("Introduction", "Organisms break down simple molecules to __________.", "store energy", "derive energy", "release CO2", "absorb O2", "option2"),
  fitb("Introduction", "CO2 which is __________ is released during catabolic reactions.", "useful", "harmless", "harmful", "essential", "option3"),
  fitb("Introduction", "O2 has to be __________ provided to the cells.", "occasionally", "continuously", "weekly", "daily", "option2"),
  fitb("Introduction", "CO2 produced by cells have to be __________.", "stored", "released out", "converted", "absorbed", "option2"),
  fitb("Introduction", "Exchange of O2 from atmosphere with CO2 from cells is called __________.", "excretion", "digestion", "breathing", "circulation", "option3"),
  fitb("Introduction", "Breathing is commonly known as __________.", "digestion", "excretion", "circulation", "respiration", "option4"),
  fitb("Introduction", "Hands on chest feel the chest moving __________ and __________.", "left and right", "up and down", "forward and backward", "in and out", "option2"),
  fitb("Introduction", "The __________ and mechanism of breathing are described in following sections.", "digestive organs", "respiratory organs", "circulatory organs", "excretory organs", "option2"),

  // ═══════════════════════════════════════════════
  //  14.1 — RESPIRATORY ORGANS
  // ═══════════════════════════════════════════════

  para(
    "Respiratory Organs",
    "Mechanisms of breathing vary among different groups of animals depending mainly on their habitats and levels of organisation. Lower invertebrates like sponges, coelenterates, flatworms, etc., exchange O2 with CO2 by simple diffusion over their entire body surface. Earthworms use their moist cuticle and insects have a network of tubes (tracheal tubes) to transport atmospheric air within the body. Special vascularised structures called gills (branchial respiration) are used by most of the aquatic arthropods and molluscs whereas vascularised bags called lungs (pulmonary respiration) are used by the terrestrial forms. Among vertebrates, fishes use gills whereas amphibians, reptiles, birds and mammals respire through lungs. Amphibians like frogs can respire through their moist skin (cutaneous respiration) also. Human airway: External nostrils → nasal chamber → pharynx (common passage for food and air) → larynx (cartilaginous sound box; glottis covered by epiglottis during swallowing) → trachea. Trachea divides at the 5th thoracic vertebra into right and left primary bronchi → secondary and tertiary bronchi → terminal bronchioles. Terminal bronchioles give rise to thin, irregular-walled, vascularised bag-like structures called alveoli — site of gas exchange. Two lungs covered by double-layered pleura with pleural fluid between them (reduces friction). Conducting part: Nostrils to terminal bronchioles. Exchange part: Alveoli + ducts. Thoracic chamber: formed by vertebral column (dorsal), sternum (ventral), ribs (lateral), diaphragm (lower). Five steps of respiration: (i) Breathing, (ii) Diffusion across alveolar membrane, (iii) Transport by blood, (iv) Diffusion between blood and tissues, (v) Cellular respiration.",
    ["alveoli", "trachea", "epiglottis", "pleura", "bronchi", "pharynx", "larynx", "gills", "lungs", "branchial", "pulmonary", "cutaneous", "spirometer"]
  ),

  ptr("Respiratory Organs", "Respiratory Organs — Key Points", [
    "Variation basis: Habitats and levels of organisation.",
    "Sponges/flatworms: Simple diffusion over body surface.",
    "Earthworm: Moist cuticle for respiration.",
    "Insects: Tracheal tubes to transport air.",
    "Aquatic arthropods/molluscs: Gills (branchial respiration).",
    "Terrestrial forms: Lungs (pulmonary respiration).",
    "Fishes: Gills; Amphibians/reptiles/birds/mammals: Lungs; Frogs: also moist skin (cutaneous).",
    "Human airway order: Nostrils → pharynx → larynx → trachea → bronchi → bronchioles → alveoli.",
    "Epiglottis: Covers glottis during swallowing — prevents food entering larynx.",
    "Trachea splits at: 5th thoracic vertebra.",
    "Cartilaginous rings: Incomplete — support trachea, bronchi, initial bronchioles.",
    "Pleural fluid: Reduces friction; double-layered pleura.",
    "Conducting part: Nostrils to terminal bronchioles.",
    "Exchange part: Alveoli + ducts.",
    "Thoracic chamber: Dorsal-vertebral column; ventral-sternum; lateral-ribs; lower-diaphragm.",
  ]),

  // MCQ
  mcq("Respiratory Organs", "Breathing mechanisms vary based on:", "Body size", "Habitats and levels of organisation", "Age", "Colour", "option2"),
  mcq("Respiratory Organs", "Sponges exchange gases by:", "Gills", "Tracheal tubes", "Simple diffusion over body surface", "Lungs", "option3"),
  mcq("Respiratory Organs", "Which organism uses moist cuticle for respiration?", "Insect", "Earthworm", "Fish", "Frog", "option2"),
  mcq("Respiratory Organs", "Insects use __________ for gas transport.", "Gills", "Lungs", "Moist skin", "Tracheal tubes", "option4"),
  mcq("Respiratory Organs", "Gills are associated with:", "Pulmonary respiration", "Cutaneous respiration", "Branchial respiration", "Tracheal respiration", "option3"),
  mcq("Respiratory Organs", "Terrestrial forms use __________ for gas exchange.", "Gills", "Tracheal tubes", "Lungs", "Moist cuticle", "option3"),
  mcq("Respiratory Organs", "Fishes respire through:", "Lungs", "Moist skin", "Tracheal tubes", "Gills", "option4"),
  mcq("Respiratory Organs", "Cutaneous respiration occurs in:", "Fishes", "Reptiles", "Frogs", "Insects", "option3"),
  mcq("Respiratory Organs", "Common passage for food and air in humans is:", "Larynx", "Pharynx", "Trachea", "Bronchus", "option2"),
  mcq("Respiratory Organs", "Larynx is called the:", "Air box", "Food box", "Sound box", "Wind box", "option3"),
  mcq("Respiratory Organs", "Which structure prevents food entering the larynx?", "Glottis", "Pharynx", "Epiglottis", "Trachea", "option3"),
  mcq("Respiratory Organs", "Trachea divides at the level of __________ thoracic vertebra.", "3rd", "4th", "5th", "6th", "option3"),
  mcq("Respiratory Organs", "Trachea and bronchi are supported by:", "Complete cartilaginous rings", "Incomplete cartilaginous rings", "Bony rings", "Muscular rings", "option2"),
  mcq("Respiratory Organs", "Actual sites of gas exchange in the lungs are:", "Bronchioles", "Bronchi", "Trachea", "Alveoli", "option4"),
  mcq("Respiratory Organs", "Lungs are covered by:", "Single-layered pleura", "Double-layered pleura", "Fibrous membrane only", "Cartilaginous sheath", "option2"),
  mcq("Respiratory Organs", "Pleural fluid functions to:", "Help gas exchange", "Reduce friction on lung surface", "Transport oxygen", "Produce mucus", "option2"),
  mcq("Respiratory Organs", "Conducting part extends from:", "Pharynx to bronchi", "External nostrils to terminal bronchioles", "Alveoli to bronchioles", "Larynx to trachea", "option2"),
  mcq("Respiratory Organs", "Exchange part consists of:", "Bronchi and bronchioles", "Trachea and bronchi", "Alveoli and their ducts", "Nostrils and pharynx", "option3"),
  mcq("Respiratory Organs", "Thoracic chamber is bounded ventrally by:", "Vertebral column", "Diaphragm", "Ribs", "Sternum", "option4"),
  mcq("Respiratory Organs", "Lower boundary of thoracic chamber is the:", "Sternum", "Vertebral column", "Diaphragm", "Ribs", "option3"),
  mcq("Respiratory Organs", "How many steps does NCERT list for respiration?", "3", "4", "5", "6", "option3"),
  mcq("Respiratory Organs", "Conducting part does NOT include:", "External nostrils", "Trachea", "Terminal bronchioles", "Alveoli", "option4"),

  // Match
  mtc("Respiratory Organs", "Match the following:",
    ["Sponges/Flatworms", "Earthworm", "Insects", "Aquatic arthropods"],
    ["P. Gills", "Q. Tracheal tubes", "R. Moist cuticle", "S. Simple diffusion over body surface"],
    "1-S, 2-R, 3-Q, 4-P", "1-P, 2-Q, 3-R, 4-S", "1-Q, 2-S, 3-P, 4-R", "1-R, 2-P, 3-S, 4-Q", "option1"),
  mtc("Respiratory Organs", "Match the following:",
    ["Fishes", "Mammals", "Frogs", "Insects"],
    ["P. Lungs", "Q. Gills", "R. Moist skin and lungs", "S. Tracheal tubes"],
    "1-Q, 2-P, 3-R, 4-S", "1-P, 2-Q, 3-S, 4-R", "1-S, 2-R, 3-Q, 4-P", "1-R, 2-S, 3-P, 4-Q", "option1"),
  mtc("Respiratory Organs", "Match the following:",
    ["External nostrils", "Larynx", "Trachea", "Alveoli"],
    ["P. Divides at 5th thoracic vertebra", "Q. Entry point for air", "R. Sound box", "S. Site of gas exchange"],
    "1-Q, 2-R, 3-P, 4-S", "1-P, 2-Q, 3-R, 4-S", "1-S, 2-P, 3-Q, 4-R", "1-R, 2-S, 3-P, 4-Q", "option1"),
  mtc("Respiratory Organs", "Match the following:",
    ["Epiglottis", "Pleural fluid", "Conducting part", "Exchange part"],
    ["P. Alveoli and their ducts", "Q. Reduces friction on lung surface", "R. Prevents food entering larynx", "S. Nostrils to terminal bronchioles"],
    "1-R, 2-Q, 3-S, 4-P", "1-Q, 2-R, 3-P, 4-S", "1-P, 2-S, 3-Q, 4-R", "1-S, 2-P, 3-R, 4-Q", "option1"),
  mtc("Respiratory Organs", "Match the following:",
    ["Vertebral column", "Sternum", "Diaphragm", "Ribs"],
    ["P. Ventral boundary", "Q. Lower boundary", "R. Lateral boundary", "S. Dorsal boundary"],
    "1-S, 2-P, 3-Q, 4-R", "1-P, 2-Q, 3-R, 4-S", "1-Q, 2-S, 3-P, 4-R", "1-R, 2-P, 3-S, 4-Q", "option1"),

  // Assertion-Reason
  ar("Respiratory Organs", "Earthworms use their moist cuticle for respiration.", "Earthworms lack gills and lungs.", "option1"),
  ar("Respiratory Organs", "Insects use tracheal tubes for gas exchange.", "Tracheal tubes transport atmospheric air directly within the body.", "option1"),
  ar("Respiratory Organs", "Frogs can respire through their moist skin.", "Frogs are amphibians capable of cutaneous respiration.", "option1"),
  ar("Respiratory Organs", "Larynx is called the sound box.", "Larynx is a cartilaginous box that helps in sound production.", "option1"),
  ar("Respiratory Organs", "Epiglottis covers the glottis during swallowing.", "Epiglottis prevents food from entering the larynx.", "option1"),
  ar("Respiratory Organs", "Trachea is supported by incomplete cartilaginous rings.", "Incomplete rings allow flexibility in tracheal diameter.", "option2"),
  ar("Respiratory Organs", "Alveoli are the actual sites of gas exchange.", "Alveoli are thin-walled and highly vascularised.", "option1"),
  ar("Respiratory Organs", "Pleural fluid reduces friction on the lung surface.", "The lungs are covered by a double-layered pleura.", "option1"),
  ar("Respiratory Organs", "The conducting part does not participate in gas exchange.", "The conducting part transports, humidifies and warms air.", "option1"),
  ar("Respiratory Organs", "Any change in thoracic volume is reflected in pulmonary volume.", "The thoracic chamber is an air-tight anatomical setup.", "option1"),
  ar("Respiratory Organs", "Trachea divides at the level of the 5th thoracic vertebra.", "The right and left primary bronchi arise from trachea division.", "option2"),
  ar("Respiratory Organs", "Amphibians respire only through their lungs.", "Frogs can also respire through their moist skin.", "option4"),

  // NCS
  ncs("Respiratory Organs", "How many of the following statements are CORRECT?", ["Sponges exchange gases by simple diffusion.", "Earthworms use tracheal tubes.", "Insects use tracheal tubes.", "Aquatic arthropods use gills."], "option3"),
  ncs("Respiratory Organs", "How many of the following statements are CORRECT?", ["Larynx is the common passage for food and air.", "Epiglottis prevents food from entering larynx.", "Trachea divides at 5th thoracic vertebra.", "Pharynx is the sound box."], "option3"),
  ncs("Respiratory Organs", "How many of the following statements are CORRECT?", ["Alveoli are the sites of gas exchange.", "Pleural fluid reduces friction.", "Conducting part extends from nostrils to terminal bronchioles.", "Trachea has complete cartilaginous rings."], "option2"),
  ncs("Respiratory Organs", "How many of the following statements are CORRECT?", ["Thoracic chamber formed by vertebral column, sternum, ribs, diaphragm.", "Pleura is single-layered.", "Exchange part consists of alveoli and their ducts.", "Breathing is one of five steps of respiration."], "option3"),
  ncs("Respiratory Organs", "How many of the following statements are CORRECT?", ["Frogs can respire through moist skin.", "Fishes use lungs.", "Mammals respire through lungs.", "Cutaneous respiration uses moist skin."], "option3"),
  ncs("Respiratory Organs", "How many of the following statements are CORRECT?", ["Conducting part humidifies inhaled air.", "Alveoli are thick-walled.", "Any change in thoracic volume reflects in pulmonary volume.", "Larynx helps in sound production."], "option3"),

  // T/F
  tf4("Respiratory Organs", "Identify whether each statement is True (T) or False (F):\n(i) Sponges use gills.\n(ii) Earthworms use moist cuticle.\n(iii) Insects use tracheal tubes.\n(iv) Fishes use lungs.", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-F, ii-F, iii-T, iv-T", "i-T, ii-T, iii-F, iv-F", "option1"),
  tf4("Respiratory Organs", "Identify whether each statement is True (T) or False (F):\n(i) Pharynx is common passage for food and air.\n(ii) Larynx is the sound box.\n(iii) Epiglottis is a bone.\n(iv) Trachea divides at 5th thoracic vertebra.", "i-T, ii-T, iii-F, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-T, ii-T, iii-T, iv-F", "option1"),
  tf4("Respiratory Organs", "Identify whether each statement is True (T) or False (F):\n(i) Alveoli are sites of gas exchange.\n(ii) Pleural fluid increases friction.\n(iii) Conducting part humidifies air.\n(iv) Thoracic chamber is air-tight.", "i-T, ii-F, iii-T, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-T, iii-F, iv-T", "i-F, ii-F, iii-T, iv-T", "option1"),
  tf4("Respiratory Organs", "Identify whether each statement is True (T) or False (F):\n(i) Frogs use moist skin for respiration.\n(ii) Mammals use gills.\n(iii) Birds respire through lungs.\n(iv) Insects use lungs.", "i-T, ii-F, iii-T, iv-F", "i-F, ii-T, iii-F, iv-T", "i-T, ii-T, iii-F, iv-T", "i-F, ii-F, iii-T, iv-F", "option1"),
  tf4("Respiratory Organs", "Identify whether each statement is True (T) or False (F):\n(i) Conducting part extends from nostrils to alveoli.\n(ii) Exchange part consists of alveoli and ducts.\n(iii) Trachea has incomplete cartilaginous rings.\n(iv) Larynx is above trachea.", "i-F, ii-T, iii-T, iv-T", "i-T, ii-F, iii-T, iv-T", "i-T, ii-T, iii-F, iv-F", "i-F, ii-F, iii-T, iv-F", "option1"),
  tf4("Respiratory Organs", "Identify whether each statement is True (T) or False (F):\n(i) Diaphragm forms lower boundary of thoracic chamber.\n(ii) Ribs form dorsal boundary.\n(iii) Sternum forms ventral boundary.\n(iv) Vertebral column forms lateral boundary.", "i-T, ii-F, iii-T, iv-F", "i-F, ii-T, iii-F, iv-T", "i-T, ii-T, iii-F, iv-T", "i-T, ii-F, iii-F, iv-T", "option1"),

  // FITB
  fitb("Respiratory Organs", "Lower invertebrates exchange gases by __________ over entire body surface.", "active transport", "simple diffusion", "osmosis", "facilitated diffusion", "option2"),
  fitb("Respiratory Organs", "Earthworms respire through their __________.", "gills", "tracheal tubes", "moist cuticle", "lungs", "option3"),
  fitb("Respiratory Organs", "Insects transport air using __________.", "gills", "lungs", "moist skin", "tracheal tubes", "option4"),
  fitb("Respiratory Organs", "Gills are associated with __________ respiration.", "pulmonary", "cutaneous", "branchial", "tracheal", "option3"),
  fitb("Respiratory Organs", "Larynx is a cartilaginous box called the __________.", "food box", "sound box", "air box", "wind box", "option2"),
  fitb("Respiratory Organs", "__________ covers the glottis during swallowing.", "Pharynx", "Trachea", "Bronchus", "Epiglottis", "option4"),
  fitb("Respiratory Organs", "Trachea divides at __________ thoracic vertebra.", "3rd", "4th", "5th", "6th", "option3"),
  fitb("Respiratory Organs", "Terminal bronchioles give rise to __________.", "bronchi", "bronchioles", "alveoli", "pleura", "option3"),
  fitb("Respiratory Organs", "The lungs are covered by a __________ layered pleura.", "single", "double", "triple", "quadruple", "option2"),
  fitb("Respiratory Organs", "From nostrils to terminal bronchioles is the __________ part.", "exchange", "respiratory", "conducting", "absorptive", "option3"),
  fitb("Respiratory Organs", "Pleural fluid serves to __________ on the lung surface.", "increase friction", "reduce friction", "produce mucus", "filter air", "option2"),
  fitb("Respiratory Organs", "Lower boundary of thoracic chamber is the dome-shaped __________.", "sternum", "vertebral column", "ribs", "diaphragm", "option4"),

  // ═══════════════════════════════════════════════
  //  14.2 — MECHANISM OF BREATHING
  // ═══════════════════════════════════════════════

  para(
    "Mechanism of Breathing",
    "Breathing involves two stages: inspiration during which atmospheric air is drawn in and expiration by which the alveolar air is released out. The movement of air into and out of the lungs is carried out by creating a pressure gradient between the lungs and the atmosphere. Inspiration occurs if intra-pulmonary pressure is less than atmospheric pressure. Expiration takes place when intra-pulmonary pressure is higher than atmospheric pressure. The diaphragm and external and internal intercostal muscles between the ribs help in generation of such gradients. Inspiration is initiated by contraction of diaphragm which increases the volume of thoracic chamber in the antero-posterior axis. Contraction of external intercostals lifts up the ribs and sternum causing an increase in the dorso-ventral axis. Relaxation of diaphragm and intercostal muscles returns them to normal positions, reduces thoracic volume and thereby pulmonary volume — intra-pulmonary pressure rises above atmospheric — expiration. Normal healthy human breathes 12-16 times/minute. Volume estimated using a spirometer. Tidal Volume (TV): ~500 mL. Inspiratory Reserve Volume (IRV): 2500-3000 mL. Expiratory Reserve Volume (ERV): 1000-1100 mL. Residual Volume (RV): 1100-1200 mL. Capacities: IC=TV+IRV | EC=TV+ERV | FRC=ERV+RV | VC=ERV+TV+IRV | TLC=VC+RV.",
    ["inspiration", "expiration", "intra-pulmonary pressure", "diaphragm", "spirometer", "Tidal Volume", "IRV", "ERV", "RV", "Vital Capacity", "TLC", "FRC"]
  ),

  ptr("Mechanism of Breathing", "Mechanism of Breathing — Key Points", [
    "Two stages: Inspiration (air in) and Expiration (air out).",
    "Inspiration condition: Intra-pulmonary pressure less than atmospheric.",
    "Expiration condition: Intra-pulmonary pressure greater than atmospheric.",
    "Muscles: Diaphragm and external/internal intercostals.",
    "Inspiration: Diaphragm contracts → thoracic vol↑ (antero-posterior) → pulmonary vol↑ → pressure↓ → air enters.",
    "External intercostals: Lift ribs and sternum → dorso-ventral axis increase.",
    "Expiration: Diaphragm relaxes → thoracic vol↓ → pulmonary vol↓ → pressure↑ → air expelled.",
    "Normal rate: 12-16 times/minute; measured by spirometer.",
    "TV: ~500 mL; ~6000-8000 mL/min.",
    "IRV: 2500-3000 mL.",
    "ERV: 1000-1100 mL.",
    "RV: 1100-1200 mL.",
    "Capacities: IC=TV+IRV | EC=TV+ERV | FRC=ERV+RV | VC=ERV+TV+IRV | TLC=VC+RV.",
  ]),

  // MCQ
  mcq("Mechanism of Breathing", "Breathing involves two stages: inspiration and:", "Circulation", "Expiration", "Diffusion", "Absorption", "option2"),
  mcq("Mechanism of Breathing", "During inspiration, atmospheric air is:", "Released out", "Drawn in", "Circulated", "Absorbed", "option2"),
  mcq("Mechanism of Breathing", "Movement of air is carried out by creating a:", "Temperature gradient", "Pressure gradient", "Concentration gradient", "Osmotic gradient", "option2"),
  mcq("Mechanism of Breathing", "Inspiration occurs when intra-pulmonary pressure is:", "Equal to atmospheric", "Greater than atmospheric", "Less than atmospheric", "Zero", "option3"),
  mcq("Mechanism of Breathing", "Expiration takes place when intra-pulmonary pressure is:", "Less than atmospheric", "Equal to atmospheric", "Greater than atmospheric", "Negative", "option3"),
  mcq("Mechanism of Breathing", "Which muscles help generate pressure gradients for breathing?", "Biceps and triceps", "Diaphragm and intercostals", "Cardiac muscles", "Abdominal muscles only", "option2"),
  mcq("Mechanism of Breathing", "Inspiration is initiated by contraction of:", "Ribs", "Sternum", "Diaphragm", "Intercostals only", "option3"),
  mcq("Mechanism of Breathing", "Contraction of diaphragm increases thoracic volume in which axis?", "Dorso-ventral", "Lateral", "Antero-posterior", "Transverse", "option3"),
  mcq("Mechanism of Breathing", "Contraction of external intercostals increases thoracic volume in which axis?", "Antero-posterior", "Dorso-ventral", "Transverse", "Vertical", "option2"),
  mcq("Mechanism of Breathing", "External intercostal muscles contract to:", "Compress thorax", "Lift ribs and sternum", "Lower sternum", "Reduce thoracic volume", "option2"),
  mcq("Mechanism of Breathing", "Expiration occurs when the diaphragm and intercostals:", "Contract further", "Relax", "Stiffen", "Are surgically removed", "option2"),
  mcq("Mechanism of Breathing", "Normal breathing rate in a healthy human is:", "5-8 times/min", "10-12 times/min", "12-16 times/min", "20-25 times/min", "option3"),
  mcq("Mechanism of Breathing", "Tidal Volume is approximately:", "200 mL", "300 mL", "500 mL", "1000 mL", "option3"),
  mcq("Mechanism of Breathing", "Inspiratory Reserve Volume averages:", "500-600 mL", "1000-1100 mL", "1500-2000 mL", "2500-3000 mL", "option4"),
  mcq("Mechanism of Breathing", "Expiratory Reserve Volume averages:", "500 mL", "1000-1100 mL", "2500-3000 mL", "1100-1200 mL", "option2"),
  mcq("Mechanism of Breathing", "Residual Volume averages:", "500 mL", "1000-1100 mL", "1100-1200 mL", "2500-3000 mL", "option3"),
  mcq("Mechanism of Breathing", "Inspiratory Capacity (IC) equals:", "TV+ERV", "TV+IRV", "ERV+RV", "TV+IRV+ERV", "option2"),
  mcq("Mechanism of Breathing", "Expiratory Capacity (EC) equals:", "TV+IRV", "TV+ERV", "ERV+RV", "TV+RV", "option2"),
  mcq("Mechanism of Breathing", "Functional Residual Capacity (FRC) equals:", "TV+IRV", "TV+ERV", "ERV+RV", "TV+RV", "option3"),
  mcq("Mechanism of Breathing", "Vital Capacity (VC) equals:", "TV+IRV", "ERV+RV", "ERV+TV+IRV", "TV+RV", "option3"),
  mcq("Mechanism of Breathing", "Total Lung Capacity (TLC) equals:", "VC+TV", "VC+RV", "VC+ERV", "VC+IRV", "option2"),
  mcq("Mechanism of Breathing", "The instrument used to estimate volumes of air is:", "Barometer", "Spirometer", "Manometer", "Sphygmomanometer", "option2"),
  mcq("Mechanism of Breathing", "Volume remaining in lungs even after forcible expiration is:", "Tidal Volume", "ERV", "IRV", "Residual Volume", "option4"),
  mcq("Mechanism of Breathing", "A healthy person can breathe approximately how much air per minute?", "2000-3000 mL", "4000-5000 mL", "6000-8000 mL", "10000-12000 mL", "option3"),

  // Match
  mtc("Mechanism of Breathing", "Match the following:",
    ["Inspiration", "Expiration", "Spirometer", "Intercostals"],
    ["P. Measures pulmonary volumes", "Q. Muscles between ribs", "R. Intra-pulmonary pressure < atmospheric", "S. Intra-pulmonary pressure > atmospheric"],
    "1-R, 2-S, 3-P, 4-Q", "1-S, 2-R, 3-Q, 4-P", "1-P, 2-Q, 3-R, 4-S", "1-Q, 2-P, 3-S, 4-R", "option1"),
  mtc("Mechanism of Breathing", "Match the following:",
    ["Tidal Volume", "IRV", "ERV", "RV"],
    ["P. 1100-1200 mL — remains after forcible expiration", "Q. 2500-3000 mL — extra by forcible inspiration", "R. ~500 mL — normal breathing", "S. 1000-1100 mL — extra by forcible expiration"],
    "1-R, 2-Q, 3-S, 4-P", "1-Q, 2-R, 3-P, 4-S", "1-S, 2-P, 3-Q, 4-R", "1-P, 2-S, 3-R, 4-Q", "option1"),
  mtc("Mechanism of Breathing", "Match the following:",
    ["IC", "EC", "FRC", "VC"],
    ["P. ERV+RV", "Q. TV+ERV", "R. ERV+TV+IRV", "S. TV+IRV"],
    "1-S, 2-Q, 3-P, 4-R", "1-Q, 2-S, 3-R, 4-P", "1-R, 2-P, 3-Q, 4-S", "1-P, 2-R, 3-S, 4-Q", "option1"),
  mtc("Mechanism of Breathing", "Match the following:",
    ["Diaphragm contracts", "Diaphragm relaxes", "Ribs and sternum lift", "Thoracic volume decreases"],
    ["P. Expiration — air expelled", "Q. Action of external intercostals", "R. Inspiration — air enters", "S. Intra-pulmonary pressure rises"],
    "1-R, 2-P, 3-Q, 4-S", "1-P, 2-R, 3-S, 4-Q", "1-Q, 2-S, 3-R, 4-P", "1-S, 2-Q, 3-P, 4-R", "option1"),

  // Assertion-Reason
  ar("Mechanism of Breathing", "Inspiration occurs when intra-pulmonary pressure is less than atmospheric pressure.", "Contraction of diaphragm increases thoracic volume which decreases intra-pulmonary pressure.", "option1"),
  ar("Mechanism of Breathing", "Expiration is a passive process under normal conditions.", "Relaxation of diaphragm and intercostals reduces thoracic volume, raising intra-pulmonary pressure.", "option2"),
  ar("Mechanism of Breathing", "Residual volume cannot be expelled even by forcible expiration.", "Residual volume maintains the lung in an inflated state at all times.", "option2"),
  ar("Mechanism of Breathing", "Vital Capacity is maximum volume breathed in after forced expiration.", "Vital Capacity = ERV + TV + IRV.", "option1"),
  ar("Mechanism of Breathing", "Total Lung Capacity is greater than Vital Capacity.", "TLC includes Residual Volume in addition to Vital Capacity.", "option1"),
  ar("Mechanism of Breathing", "A healthy human breathes 12-16 times per minute.", "Spirometer is used to measure the volume of air involved in breathing.", "option2"),
  ar("Mechanism of Breathing", "Contraction of external intercostal muscles increases thoracic volume.", "External intercostals lift ribs and sternum in the dorso-ventral axis.", "option1"),
  ar("Mechanism of Breathing", "Functional Residual Capacity includes ERV and RV.", "FRC is the volume of air remaining in the lungs after a normal expiration.", "option1"),
  ar("Mechanism of Breathing", "Tidal Volume is approximately 500 mL.", "A healthy person can breathe approximately 6000-8000 mL of air per minute.", "option2"),
  ar("Mechanism of Breathing", "Inspiratory Capacity is larger than Tidal Volume.", "IC = TV + IRV, which is greater than TV alone.", "option1"),

  // NCS
  ncs("Mechanism of Breathing", "How many of the following statements are CORRECT?", ["Inspiration occurs when intra-pulmonary pressure > atmospheric.", "Expiration occurs when intra-pulmonary pressure > atmospheric.", "Diaphragm contracts during inspiration.", "Normal breathing rate is 12-16 times/min."], "option3"),
  ncs("Mechanism of Breathing", "How many of the following statements are CORRECT?", ["Tidal Volume is approximately 500 mL.", "IRV averages 2500-3000 mL.", "ERV averages 1000-1100 mL.", "RV averages 500-600 mL."], "option3"),
  ncs("Mechanism of Breathing", "How many of the following statements are CORRECT?", ["IC = TV+IRV.", "EC = TV+ERV.", "FRC = ERV+IRV.", "VC = ERV+TV+IRV."], "option2"),
  ncs("Mechanism of Breathing", "How many of the following statements are CORRECT?", ["TLC = VC+RV.", "Spirometer is used to measure breathing volumes.", "Residual volume remains after forcible expiration.", "Vital capacity = RV+IRV."], "option3"),
  ncs("Mechanism of Breathing", "How many of the following statements are CORRECT?", ["Relaxation of diaphragm causes expiration.", "Contraction of external intercostals lifts ribs and sternum.", "Intra-pulmonary pressure rises during expiration.", "Breathing volumes are measured using a manometer."], "option3"),
  ncs("Mechanism of Breathing", "How many of the following statements are CORRECT?", ["TV is the volume inspired/expired during normal respiration.", "FRC = ERV+RV.", "IC = TV+ERV.", "TLC = VC+ERV."], "option2"),

  // T/F
  tf4("Mechanism of Breathing", "Identify whether each statement is True (T) or False (F):\n(i) Inspiration: intra-pulmonary pressure < atmospheric.\n(ii) Expiration: intra-pulmonary pressure < atmospheric.\n(iii) Diaphragm contracts during inspiration.\n(iv) RV = 500 mL.", "i-T, ii-F, iii-T, iv-F", "i-F, ii-T, iii-T, iv-F", "i-T, ii-T, iii-F, iv-T", "i-F, ii-F, iii-T, iv-T", "option1"),
  tf4("Mechanism of Breathing", "Identify whether each statement is True (T) or False (F):\n(i) TV = ~500 mL.\n(ii) IRV = 1000-1100 mL.\n(iii) ERV = 1000-1100 mL.\n(iv) RV = 1100-1200 mL.", "i-T, ii-F, iii-T, iv-T", "i-T, ii-T, iii-T, iv-F", "i-F, ii-T, iii-F, iv-T", "i-T, ii-F, iii-F, iv-T", "option1"),
  tf4("Mechanism of Breathing", "Identify whether each statement is True (T) or False (F):\n(i) IC = TV+IRV.\n(ii) EC = TV+ERV.\n(iii) FRC = ERV+IRV.\n(iv) VC = ERV+TV+IRV.", "i-T, ii-T, iii-F, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-T, ii-T, iii-T, iv-F", "option1"),
  tf4("Mechanism of Breathing", "Identify whether each statement is True (T) or False (F):\n(i) TLC = VC+RV.\n(ii) Spirometer measures pulmonary volumes.\n(iii) Normal breathing rate is 20-25/min.\n(iv) Residual volume cannot be expelled.", "i-T, ii-T, iii-F, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-F, ii-F, iii-F, iv-T", "option1"),
  tf4("Mechanism of Breathing", "Identify whether each statement is True (T) or False (F):\n(i) Diaphragm relaxation causes expiration.\n(ii) External intercostals lift ribs during inspiration.\n(iii) Thoracic volume decreases during inspiration.\n(iv) Intra-pulmonary pressure rises during expiration.", "i-T, ii-T, iii-F, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-T, ii-T, iii-T, iv-F", "option1"),

  // FITB
  fitb("Mechanism of Breathing", "During __________, atmospheric air is drawn in.", "expiration", "inspiration", "diffusion", "absorption", "option2"),
  fitb("Mechanism of Breathing", "Inspiration occurs when intra-pulmonary pressure is __________ atmospheric pressure.", "equal to", "greater than", "less than", "independent of", "option3"),
  fitb("Mechanism of Breathing", "The __________ and intercostals help generate pressure gradients for breathing.", "diaphragm", "sternum", "ribs", "vertebral column", "option1"),
  fitb("Mechanism of Breathing", "Tidal Volume is approximately __________ mL.", "200", "300", "500", "1000", "option3"),
  fitb("Mechanism of Breathing", "IRV averages __________ mL.", "500", "1000-1100", "1100-1200", "2500-3000", "option4"),
  fitb("Mechanism of Breathing", "RV is the volume remaining even after __________.", "normal inspiration", "normal expiration", "forcible expiration", "forcible inspiration", "option3"),
  fitb("Mechanism of Breathing", "Vital Capacity = ERV + TV + __________.", "RV", "IRV", "FRC", "IC", "option2"),
  fitb("Mechanism of Breathing", "Total Lung Capacity = Vital Capacity + __________.", "TV", "ERV", "IRV", "RV", "option4"),
  fitb("Mechanism of Breathing", "The instrument used to measure breathing volumes is a __________.", "barometer", "manometer", "spirometer", "thermometer", "option3"),
  fitb("Mechanism of Breathing", "Normal breathing rate is __________ times/minute.", "5-8", "8-10", "12-16", "20-25", "option3"),
  fitb("Mechanism of Breathing", "Functional Residual Capacity = ERV + __________.", "TV", "IRV", "RV", "IC", "option3"),
  fitb("Mechanism of Breathing", "Inspiratory Capacity = TV + __________.", "RV", "ERV", "IRV", "FRC", "option3"),

  // ═══════════════════════════════════════════════
  //  14.3 — EXCHANGE OF GASES
  // ═══════════════════════════════════════════════

  para(
    "Exchange of Gases",
    "Alveoli are the primary sites of exchange of gases. Exchange of gases also occurs between blood and tissues. O2 and CO2 are exchanged in these sites by simple diffusion mainly based on pressure/concentration gradient. Solubility of gases and the thickness of the membranes involved in diffusion are also important factors. Pressure contributed by an individual gas in a mixture of gases is called partial pressure — represented as pO2 for oxygen and pCO2 for carbon dioxide. Partial pressures (mm Hg) — O2: Atmospheric air-159, Alveoli-104, Deoxygenated blood-40, Oxygenated blood-95, Tissues-40. Partial pressures (mm Hg) — CO2: Atmospheric air-0.3, Alveoli-40, Deoxygenated blood-45, Oxygenated blood-40, Tissues-45. Data shows a concentration gradient for O2: alveoli → blood → tissues. Gradient for CO2 is opposite: tissues → blood → alveoli. The solubility of CO2 is 20-25 times higher than that of O2. The diffusion membrane has three layers: (1) thin squamous epithelium of alveoli, (2) endothelium of alveolar capillaries, (3) basement substance between them. Total thickness of diffusion membrane is much less than a millimetre.",
    ["partial pressure", "pO2", "pCO2", "diffusion membrane", "alveoli", "simple diffusion", "CO2 solubility", "squamous epithelium", "basement substance"]
  ),

  ptr("Exchange of Gases", "Exchange of Gases — Key Points", [
    "Primary site: Alveoli; also between blood and tissues.",
    "Method: Simple diffusion based on pressure/concentration gradient.",
    "Other factors: Solubility of gases and thickness of membrane.",
    "Partial pressure: Pressure of an individual gas in a mixture.",
    "pO2 values (mm Hg): Atm-159 | Alveoli-104 | Deoxy blood-40 | Oxy blood-95 | Tissues-40.",
    "pCO2 values (mm Hg): Atm-0.3 | Alveoli-40 | Deoxy blood-45 | Oxy blood-40 | Tissues-45.",
    "O2 gradient: Alveoli → blood → tissues.",
    "CO2 gradient: Tissues → blood → alveoli.",
    "CO2 solubility: 20-25 times higher than O2.",
    "Diffusion membrane (3 layers): Squamous epithelium of alveoli + endothelium of alveolar capillaries + basement substance.",
    "Thickness: Much less than a millimetre.",
  ]),

  // MCQ
  mcq("Exchange of Gases", "Primary sites of exchange of gases are:", "Bronchioles", "Alveoli", "Trachea", "Bronchi", "option2"),
  mcq("Exchange of Gases", "O2 and CO2 are exchanged by:", "Active transport", "Osmosis", "Simple diffusion", "Facilitated diffusion", "option3"),
  mcq("Exchange of Gases", "Main basis of gas exchange is:", "Temperature gradient", "Pressure/concentration gradient", "Osmotic gradient", "Electrical gradient", "option2"),
  mcq("Exchange of Gases", "Which does NOT affect rate of diffusion of gases?", "Partial pressure gradient", "Solubility of gases", "Thickness of membrane", "Colour of gas", "option4"),
  mcq("Exchange of Gases", "Partial pressure of O2 in alveoli is (mm Hg):", "159", "104", "40", "95", "option2"),
  mcq("Exchange of Gases", "Partial pressure of O2 in deoxygenated blood is (mm Hg):", "104", "95", "40", "0.3", "option3"),
  mcq("Exchange of Gases", "Partial pressure of CO2 in alveoli is (mm Hg):", "0.3", "45", "40", "104", "option3"),
  mcq("Exchange of Gases", "Partial pressure of CO2 in tissues is (mm Hg):", "0.3", "40", "45", "95", "option3"),
  mcq("Exchange of Gases", "Partial pressure of O2 in atmospheric air is (mm Hg):", "40", "104", "95", "159", "option4"),
  mcq("Exchange of Gases", "Partial pressure of CO2 in atmospheric air is (mm Hg):", "40", "45", "0.3", "95", "option3"),
  mcq("Exchange of Gases", "Partial pressure of O2 in oxygenated blood is (mm Hg):", "40", "104", "95", "159", "option3"),
  mcq("Exchange of Gases", "Partial pressure of CO2 in oxygenated blood is (mm Hg):", "0.3", "40", "45", "95", "option2"),
  mcq("Exchange of Gases", "Partial pressure of CO2 in deoxygenated blood is (mm Hg):", "0.3", "40", "45", "95", "option3"),
  mcq("Exchange of Gases", "Solubility of CO2 compared to O2 is:", "Same", "5 times higher", "10 times higher", "20-25 times higher", "option4"),
  mcq("Exchange of Gases", "The diffusion membrane has how many major layers?", "2", "3", "4", "5", "option3"),
  mcq("Exchange of Gases", "Which is NOT a layer of the diffusion membrane?", "Squamous epithelium of alveoli", "Endothelium of alveolar capillaries", "Basement substance", "Smooth muscle layer of bronchioles", "option4"),
  mcq("Exchange of Gases", "Total thickness of diffusion membrane is:", "More than a millimetre", "Exactly a millimetre", "Much less than a millimetre", "About 5 mm", "option3"),
  mcq("Exchange of Gases", "O2 moves from alveoli into deoxygenated blood because:", "pO2 in alveoli (104) > pO2 in deoxy blood (40)", "pO2 in deoxy blood > pO2 in alveoli", "Active transport drives it", "Temperature difference drives it", "option1"),
  mcq("Exchange of Gases", "CO2 moves from tissues to blood because:", "pCO2 in tissues (45) > pCO2 in oxy blood (40)", "pCO2 in blood > pCO2 in tissues", "Active transport drives it", "O2 pushes it out", "option1"),
  mcq("Exchange of Gases", "The direction of O2 gradient is:", "Tissues → blood → alveoli", "Alveoli → blood → tissues", "Blood → alveoli → tissues", "Tissues → alveoli → blood", "option2"),

  // Match
  mtc("Exchange of Gases", "Match the following:",
    ["pO2 — atmospheric", "pO2 — alveoli", "pO2 — deoxygenated blood", "pO2 — oxygenated blood"],
    ["P. 95 mm Hg", "Q. 40 mm Hg", "R. 104 mm Hg", "S. 159 mm Hg"],
    "1-S, 2-R, 3-Q, 4-P", "1-R, 2-S, 3-P, 4-Q", "1-Q, 2-P, 3-R, 4-S", "1-P, 2-Q, 3-S, 4-R", "option1"),
  mtc("Exchange of Gases", "Match the following:",
    ["pCO2 — atmospheric", "pCO2 — alveoli", "pCO2 — deoxygenated blood", "pCO2 — tissues"],
    ["P. 45 mm Hg", "Q. 40 mm Hg", "R. 0.3 mm Hg", "S. 45 mm Hg"],
    "1-R, 2-Q, 3-P, 4-S", "1-Q, 2-R, 3-S, 4-P", "1-P, 2-S, 3-Q, 4-R", "1-S, 2-P, 3-R, 4-Q", "option1"),
  mtc("Exchange of Gases", "Match the following:",
    ["Alveoli", "Simple diffusion", "CO2 solubility", "Basement substance"],
    ["P. 20-25 times higher than O2", "Q. Part of diffusion membrane", "R. Primary site of gas exchange", "S. Method of gas exchange"],
    "1-R, 2-S, 3-P, 4-Q", "1-P, 2-Q, 3-R, 4-S", "1-Q, 2-P, 3-S, 4-R", "1-S, 2-R, 3-Q, 4-P", "option1"),
  mtc("Exchange of Gases", "Match the following:",
    ["O2 gradient", "CO2 gradient", "pO2 tissues", "pCO2 alveoli"],
    ["P. 40 mm Hg", "Q. Tissues → blood → alveoli", "R. Alveoli → blood → tissues", "S. 40 mm Hg"],
    "1-R, 2-Q, 3-P, 4-S", "1-Q, 2-R, 3-S, 4-P", "1-S, 2-P, 3-Q, 4-R", "1-P, 2-S, 3-R, 4-Q", "option1"),

  // Assertion-Reason
  ar("Exchange of Gases", "Alveoli are the primary sites of gas exchange.", "Alveoli are thin-walled, vascularised structures providing large surface area for diffusion.", "option1"),
  ar("Exchange of Gases", "CO2 diffuses more rapidly than O2 per unit pressure difference.", "Solubility of CO2 is 20-25 times higher than O2.", "option1"),
  ar("Exchange of Gases", "O2 moves from alveoli into deoxygenated blood.", "pO2 in alveoli (104 mm Hg) is higher than in deoxygenated blood (40 mm Hg).", "option1"),
  ar("Exchange of Gases", "CO2 moves from tissues into blood.", "pCO2 in tissues (45 mm Hg) is higher than in oxygenated blood (40 mm Hg).", "option1"),
  ar("Exchange of Gases", "The diffusion membrane is highly efficient for gas exchange.", "Total thickness of the diffusion membrane is much less than a millimetre.", "option1"),
  ar("Exchange of Gases", "pO2 in atmospheric air is 159 mm Hg.", "Atmospheric air contains approximately 21% O2.", "option2"),
  ar("Exchange of Gases", "pCO2 in tissues equals pCO2 in deoxygenated blood.", "Both deoxygenated blood and tissues have pCO2 of 45 mm Hg.", "option2"),
  ar("Exchange of Gases", "Gas exchange between blood and tissues also occurs by simple diffusion.", "Partial pressure gradients drive gas exchange at all sites.", "option1"),
  ar("Exchange of Gases", "pO2 in tissues equals pO2 in deoxygenated blood.", "Both have pO2 of 40 mm Hg according to NCERT data.", "option2"),
  ar("Exchange of Gases", "Thickness of diffusion membrane is the most important factor in gas exchange.", "The thickness of the diffusion membrane is much less than a millimetre, facilitating diffusion.", "option3"),

  // NCS
  ncs("Exchange of Gases", "How many of the following statements are CORRECT?", ["Alveoli are primary sites of gas exchange.", "Gas exchange occurs only at alveoli, not between blood and tissues.", "O2 and CO2 are exchanged by simple diffusion.", "Partial pressure gradient drives gas exchange."], "option3"),
  ncs("Exchange of Gases", "How many of the following statements are CORRECT?", ["pO2 in alveoli is 104 mm Hg.", "pO2 in deoxygenated blood is 40 mm Hg.", "pO2 in oxygenated blood is 159 mm Hg.", "pO2 in atmospheric air is 159 mm Hg."], "option3"),
  ncs("Exchange of Gases", "How many of the following statements are CORRECT?", ["pCO2 in atmospheric air is 0.3 mm Hg.", "pCO2 in alveoli is 40 mm Hg.", "pCO2 in tissues is 45 mm Hg.", "pCO2 in oxygenated blood is 40 mm Hg."], "option4"),
  ncs("Exchange of Gases", "How many of the following statements are CORRECT?", ["CO2 solubility is 20-25 times higher than O2.", "O2 solubility is higher than CO2.", "Diffusion membrane is much less than a mm thick.", "Squamous epithelium of alveoli is one layer of diffusion membrane."], "option3"),
  ncs("Exchange of Gases", "How many of the following statements are CORRECT?", ["O2 gradient is from alveoli to blood to tissues.", "CO2 gradient is from alveoli to tissues.", "Endothelium of alveolar capillaries is part of diffusion membrane.", "Basement substance is part of diffusion membrane."], "option3"),
  ncs("Exchange of Gases", "How many of the following statements are CORRECT?", ["pO2 in tissues is 40 mm Hg.", "pCO2 in deoxy blood is 45 mm Hg.", "O2 diffuses by active transport.", "Diffusion membrane has 3 layers."], "option3"),

  // T/F
  tf4("Exchange of Gases", "Identify whether each statement is True (T) or False (F):\n(i) Alveoli are primary gas exchange sites.\n(ii) Gas exchange occurs by active transport.\n(iii) pO2 in alveoli is 104 mm Hg.\n(iv) CO2 solubility equals O2 solubility.", "i-T, ii-F, iii-T, iv-F", "i-F, ii-T, iii-T, iv-F", "i-T, ii-T, iii-F, iv-T", "i-F, ii-F, iii-T, iv-T", "option1"),
  tf4("Exchange of Gases", "Identify whether each statement is True (T) or False (F):\n(i) pCO2 in tissues is 45 mm Hg.\n(ii) pO2 in deoxygenated blood is 95 mm Hg.\n(iii) CO2 moves from tissues to blood.\n(iv) pCO2 in atmospheric air is 0.3 mm Hg.", "i-T, ii-F, iii-T, iv-T", "i-F, ii-T, iii-F, iv-T", "i-T, ii-T, iii-T, iv-F", "i-F, ii-F, iii-T, iv-F", "option1"),
  tf4("Exchange of Gases", "Identify whether each statement is True (T) or False (F):\n(i) Diffusion membrane has 3 major layers.\n(ii) Squamous epithelium of alveoli is one layer.\n(iii) Diffusion membrane is more than a mm thick.\n(iv) CO2 is 20-25 times more soluble than O2.", "i-T, ii-T, iii-F, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-F, ii-F, iii-F, iv-T", "option1"),
  tf4("Exchange of Gases", "Identify whether each statement is True (T) or False (F):\n(i) O2 gradient is from alveoli to blood to tissues.\n(ii) CO2 gradient is from alveoli to tissues.\n(iii) pO2 in atmospheric air is 159 mm Hg.\n(iv) pCO2 in alveoli is 40 mm Hg.", "i-T, ii-F, iii-T, iv-T", "i-F, ii-T, iii-F, iv-T", "i-T, ii-T, iii-F, iv-F", "i-T, ii-T, iii-T, iv-F", "option1"),
  tf4("Exchange of Gases", "Identify whether each statement is True (T) or False (F):\n(i) pO2 in tissues is 40 mm Hg.\n(ii) pCO2 in oxygenated blood is 40 mm Hg.\n(iii) O2 diffuses from blood to alveoli.\n(iv) Endothelium of alveolar capillaries is part of diffusion membrane.", "i-T, ii-T, iii-F, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-F, ii-F, iii-T, iv-T", "option1"),

  // FITB
  fitb("Exchange of Gases", "O2 and CO2 are exchanged by __________ based on pressure/concentration gradient.", "active transport", "osmosis", "simple diffusion", "facilitated diffusion", "option3"),
  fitb("Exchange of Gases", "Pressure of an individual gas in a mixture is called __________.", "vapour pressure", "osmotic pressure", "partial pressure", "hydrostatic pressure", "option3"),
  fitb("Exchange of Gases", "Partial pressure of O2 in alveoli is __________ mm Hg.", "40", "95", "104", "159", "option3"),
  fitb("Exchange of Gases", "Partial pressure of CO2 in tissues is __________ mm Hg.", "0.3", "40", "45", "95", "option3"),
  fitb("Exchange of Gases", "CO2 is __________ times more soluble than O2.", "5", "10", "15", "20-25", "option4"),
  fitb("Exchange of Gases", "The diffusion membrane consists of __________ major layers.", "2", "3", "4", "5", "option2"),
  fitb("Exchange of Gases", "Total thickness of diffusion membrane is __________.", "more than a mm", "exactly a mm", "much less than a mm", "about 5 mm", "option3"),
  fitb("Exchange of Gases", "O2 moves from __________ to deoxygenated blood.", "tissues", "oxygenated blood", "alveoli", "atmosphere", "option3"),
  fitb("Exchange of Gases", "CO2 moves from __________ to blood.", "alveoli", "oxygenated blood", "atmosphere", "tissues", "option4"),
  fitb("Exchange of Gases", "pO2 in atmospheric air is __________ mm Hg.", "40", "95", "104", "159", "option4"),
  fitb("Exchange of Gases", "pCO2 in deoxygenated blood is __________ mm Hg.", "0.3", "40", "45", "95", "option3"),
  fitb("Exchange of Gases", "pO2 in oxygenated blood is __________ mm Hg.", "40", "95", "104", "159", "option2"),

  // ═══════════════════════════════════════════════
  //  14.4 — TRANSPORT OF GASES
  // ═══════════════════════════════════════════════

  para(
    "Transport of Gases",
    "Blood is the medium of transport for O2 and CO2. About 97% of O2 is transported by RBCs. The remaining 3% of O2 is carried in dissolved state through plasma. Nearly 20-25% of CO2 is transported by RBCs whereas 70% of it is carried as bicarbonate. About 7% of CO2 is carried in dissolved state through plasma. Haemoglobin is a red coloured iron-containing pigment in RBCs. O2 binds haemoglobin reversibly to form oxyhaemoglobin. Each haemoglobin molecule can carry a maximum of four molecules of O2. Binding of O2 with haemoglobin is primarily related to partial pressure of O2. Also affected by pCO2, hydrogen ion concentration and temperature. A sigmoid curve (Oxygen dissociation curve) is obtained when % saturation of Hb with O2 is plotted against pO2. In alveoli: high pO2, low pCO2, lesser H+, lower temperature → oxyhaemoglobin forms. In tissues: low pO2, high pCO2, high H+, higher temperature → O2 dissociates from oxyhaemoglobin. Every 100 mL of oxygenated blood delivers around 5 mL of O2 to the tissues under normal physiological conditions. CO2 is carried by haemoglobin as carbamino-haemoglobin (~20-25%). At tissues (high pCO2, low pO2): more CO2 binds. At alveoli (low pCO2, high pO2): CO2 dissociates. RBCs contain high concentration of carbonic anhydrase. This enzyme catalyses: CO2 + H2O → H2CO3 → HCO3- + H+. Every 100 mL of deoxygenated blood delivers approximately 4 mL of CO2 to the alveoli.",
    ["oxyhaemoglobin", "carbamino-haemoglobin", "carbonic anhydrase", "oxygen dissociation curve", "sigmoid", "bicarbonate", "haemoglobin", "RBCs", "plasma"]
  ),

  ptr("Transport of Gases", "Transport of Gases — Key Points", [
    "O2 transport: 97% by RBCs (oxyhaemoglobin); 3% dissolved in plasma.",
    "CO2 transport: 70% as bicarbonate; 20-25% as carbamino-Hb by RBCs; 7% dissolved in plasma.",
    "Haemoglobin: Red, iron-containing pigment in RBCs. Binds up to 4 O2 molecules reversibly.",
    "Oxyhaemoglobin forms in alveoli: high pO2, low pCO2, low H+, low temperature.",
    "O2 dissociation in tissues: low pO2, high pCO2, high H+, high temperature.",
    "O2 dissociation curve: Sigmoid shape; % Hb saturation vs pO2.",
    "O2 delivery: 100 mL oxygenated blood → ~5 mL O2 to tissues.",
    "Carbamino-Hb: CO2 + Hb; forms at tissues (high pCO2); dissociates at alveoli (low pCO2).",
    "Carbonic anhydrase: Enzyme in RBCs; CO2+H2O ⇌ HCO3-+H+.",
    "CO2 delivery: 100 mL deoxygenated blood → ~4 mL CO2 to alveoli.",
  ]),

  // MCQ
  mcq("Transport of Gases", "Percentage of O2 transported by RBCs:", "3%", "70%", "97%", "20-25%", "option3"),
  mcq("Transport of Gases", "Percentage of O2 dissolved in plasma:", "97%", "70%", "20-25%", "3%", "option4"),
  mcq("Transport of Gases", "Percentage of CO2 carried as bicarbonate:", "3%", "7%", "20-25%", "70%", "option4"),
  mcq("Transport of Gases", "Percentage of CO2 transported as carbamino-haemoglobin:", "3%", "7%", "20-25%", "70%", "option3"),
  mcq("Transport of Gases", "Percentage of CO2 dissolved in plasma:", "70%", "20-25%", "3%", "7%", "option4"),
  mcq("Transport of Gases", "Haemoglobin is present in:", "Plasma", "WBCs", "RBCs", "Platelets", "option3"),
  mcq("Transport of Gases", "Each haemoglobin molecule can carry maximum how many O2 molecules?", "1", "2", "4", "8", "option3"),
  mcq("Transport of Gases", "O2 combined with haemoglobin forms:", "Carbamino-haemoglobin", "Carboxyhaemoglobin", "Oxyhaemoglobin", "Methaemoglobin", "option3"),
  mcq("Transport of Gases", "The oxygen dissociation curve is:", "Linear", "Parabolic", "Sigmoid", "Hyperbolic", "option1"),
  mcq("Transport of Gases", "In the alveoli, which condition favours oxyhaemoglobin formation?", "Low pO2", "High pCO2", "High H+", "Low pCO2", "option4"),
  mcq("Transport of Gases", "In tissues, which condition favours O2 dissociation from oxyhaemoglobin?", "High pO2", "Low pCO2", "High H+", "Low temperature", "option3"),
  mcq("Transport of Gases", "100 mL of oxygenated blood delivers how much O2 to tissues?", "2 mL", "3 mL", "5 mL", "10 mL", "option3"),
  mcq("Transport of Gases", "CO2 carried by haemoglobin forms:", "Oxyhaemoglobin", "Carbamino-haemoglobin", "Methaemoglobin", "Carboxyhaemoglobin", "option2"),
  mcq("Transport of Gases", "Enzyme present in high concentration in RBCs:", "Amylase", "Lipase", "Carbonic anhydrase", "Catalase", "option3"),
  mcq("Transport of Gases", "Carbonic anhydrase catalyses reaction between:", "O2 and H2O", "CO2 and H2O", "Hb and O2", "Hb and CO2", "option2"),
  mcq("Transport of Gases", "100 mL of deoxygenated blood delivers how much CO2 to alveoli?", "2 mL", "4 mL", "7 mL", "10 mL", "option2"),
  mcq("Transport of Gases", "At the alveolar site, bicarbonate reaction reverses to form:", "HCO3- + H+", "CO2 + H2O", "Oxyhaemoglobin", "Carbamino-haemoglobin", "option2"),
  mcq("Transport of Gases", "Which factor does NOT affect O2-Hb binding?", "pO2", "pCO2", "H+ concentration", "Blood group", "option4"),
  mcq("Transport of Gases", "In alveoli, CO2 __________ from carbamino-haemoglobin.", "binds more", "dissociates", "accumulates", "polymerises", "option2"),
  mcq("Transport of Gases", "Binding of O2 with Hb is primarily related to:", "Temperature", "pCO2", "Partial pressure of O2", "H+ concentration", "option3"),
  mcq("Transport of Gases", "When pCO2 is high and pO2 is low, more __________ forms.", "oxyhaemoglobin", "carbamino-haemoglobin", "methaemoglobin", "carboxyhaemoglobin", "option2"),

  // Match
  mtc("Transport of Gases", "Match the following:",
    ["97% O2", "3% O2", "70% CO2", "7% CO2"],
    ["P. Dissolved in plasma", "Q. Carried as bicarbonate", "R. Transported as oxyhaemoglobin by RBCs", "S. Dissolved in plasma"],
    "1-R, 2-P, 3-Q, 4-S", "1-Q, 2-R, 3-P, 4-S", "1-P, 2-S, 3-R, 4-Q", "1-S, 2-Q, 3-R, 4-P", "option1"),
  mtc("Transport of Gases", "Match the following:",
    ["Alveoli conditions", "Tissue conditions", "Oxyhaemoglobin", "Carbamino-haemoglobin"],
    ["P. CO2 bound to Hb", "Q. O2 bound to Hb", "R. Low pO2, high pCO2, high H+", "S. High pO2, low pCO2, low H+"],
    "1-S, 2-R, 3-Q, 4-P", "1-R, 2-S, 3-P, 4-Q", "1-Q, 2-P, 3-R, 4-S", "1-P, 2-Q, 3-S, 4-R", "option1"),
  mtc("Transport of Gases", "Match the following:",
    ["Carbonic anhydrase", "Sigmoid curve", "5 mL O2", "4 mL CO2"],
    ["P. Per 100 mL deoxy blood to alveoli", "Q. Per 100 mL oxy blood to tissues", "R. Oxygen dissociation curve shape", "S. Enzyme in RBCs for CO2+H2O"],
    "1-S, 2-R, 3-Q, 4-P", "1-Q, 2-S, 3-P, 4-R", "1-R, 2-P, 3-S, 4-Q", "1-P, 2-Q, 3-R, 4-S", "option1"),
  mtc("Transport of Gases", "Match the following:",
    ["20-25% CO2", "70% CO2", "97% O2", "3% O2"],
    ["P. Dissolved in plasma", "Q. As oxyhaemoglobin in RBCs", "R. As bicarbonate in plasma", "S. As carbamino-haemoglobin in RBCs"],
    "1-S, 2-R, 3-Q, 4-P", "1-R, 2-S, 3-P, 4-Q", "1-Q, 2-P, 3-S, 4-R", "1-P, 2-Q, 3-R, 4-S", "option1"),

  // Assertion-Reason
  ar("Transport of Gases", "97% of O2 is transported by RBCs.", "Haemoglobin in RBCs binds O2 reversibly to form oxyhaemoglobin.", "option1"),
  ar("Transport of Gases", "The oxygen dissociation curve is sigmoid.", "Haemoglobin binds O2 in a cooperative manner influenced by pO2.", "option1"),
  ar("Transport of Gases", "O2 gets bound to haemoglobin in the lungs.", "In alveoli, high pO2 and low pCO2 favour oxyhaemoglobin formation.", "option1"),
  ar("Transport of Gases", "O2 dissociates from oxyhaemoglobin in the tissues.", "In tissues, low pO2 and high pCO2 favour dissociation.", "option1"),
  ar("Transport of Gases", "70% of CO2 is transported as bicarbonate.", "Carbonic anhydrase catalyses formation of bicarbonate from CO2 and H2O.", "option1"),
  ar("Transport of Gases", "Carbamino-haemoglobin forms in the tissues.", "pCO2 is high in tissues, promoting CO2 binding to haemoglobin.", "option1"),
  ar("Transport of Gases", "100 mL of oxygenated blood delivers 5 mL O2 to tissues under normal conditions.", "This delivery can increase during strenuous exercise.", "option2"),
  ar("Transport of Gases", "Carbonic anhydrase is in high concentration in RBCs.", "Carbonic anhydrase facilitates reversible formation of bicarbonate from CO2.", "option1"),
  ar("Transport of Gases", "At alveolar site, HCO3- converts back to CO2 and H2O.", "pCO2 is low at alveoli, so carbonic anhydrase reaction reverses.", "option1"),
  ar("Transport of Gases", "pO2 affects binding of CO2 to haemoglobin.", "When pO2 is high (alveoli), carbamino-haemoglobin dissociates.", "option1"),

  // NCS
  ncs("Transport of Gases", "How many of the following statements are CORRECT?", ["97% of O2 transported by RBCs.", "3% of O2 dissolved in plasma.", "70% of CO2 carried as bicarbonate.", "7% of CO2 transported by RBCs."], "option3"),
  ncs("Transport of Gases", "How many of the following statements are CORRECT?", ["Haemoglobin can carry 4 molecules of O2.", "O2 binds irreversibly to haemoglobin.", "Oxygen dissociation curve is sigmoid.", "pCO2 affects O2-Hb binding."], "option3"),
  ncs("Transport of Gases", "How many of the following statements are CORRECT?", ["High pO2 in alveoli favours oxyhaemoglobin formation.", "High H+ in alveoli favours oxyhaemoglobin formation.", "Low temperature in alveoli favours oxyhaemoglobin.", "Low pCO2 in alveoli favours oxyhaemoglobin."], "option3"),
  ncs("Transport of Gases", "How many of the following statements are CORRECT?", ["Carbonic anhydrase in high conc. in RBCs.", "Carbonic anhydrase converts CO2+H2O to HCO3-+H+.", "The reaction is irreversible.", "100 mL deoxy blood delivers 4 mL CO2 to alveoli."], "option3"),
  ncs("Transport of Gases", "How many of the following statements are CORRECT?", ["CO2 carried as carbamino-haemoglobin.", "Carbamino-Hb forms at high pCO2.", "100 mL oxy blood delivers 5 mL O2 to tissues.", "CO2 binds to the iron part of haemoglobin."], "option3"),

  // T/F
  tf4("Transport of Gases", "Identify whether each statement is True (T) or False (F):\n(i) 97% O2 transported by RBCs.\n(ii) 70% CO2 as bicarbonate.\n(iii) 7% CO2 by RBCs as carbamino-Hb.\n(iv) 3% O2 dissolved in plasma.", "i-T, ii-T, iii-F, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-T, ii-T, iii-T, iv-F", "option1"),
  tf4("Transport of Gases", "Identify whether each statement is True (T) or False (F):\n(i) Haemoglobin carries 4 O2 molecules.\n(ii) O2 binds irreversibly to Hb.\n(iii) Oxygen dissociation curve is sigmoid.\n(iv) pCO2 does not affect O2-Hb binding.", "i-T, ii-F, iii-T, iv-F", "i-F, ii-T, iii-T, iv-F", "i-T, ii-T, iii-F, iv-T", "i-F, ii-F, iii-T, iv-T", "option1"),
  tf4("Transport of Gases", "Identify whether each statement is True (T) or False (F):\n(i) High pO2 in alveoli favours oxyhaemoglobin.\n(ii) High H+ in tissues favours O2 dissociation.\n(iii) Carbonic anhydrase is in high conc. in RBCs.\n(iv) Carbamino-Hb forms at low pCO2.", "i-T, ii-T, iii-T, iv-F", "i-F, ii-T, iii-T, iv-T", "i-T, ii-F, iii-T, iv-T", "i-T, ii-T, iii-F, iv-T", "option1"),
  tf4("Transport of Gases", "Identify whether each statement is True (T) or False (F):\n(i) 100 mL oxy blood delivers 5 mL O2.\n(ii) 100 mL deoxy blood delivers 4 mL CO2.\n(iii) At alveoli, HCO3- converts back to CO2+H2O.\n(iv) At tissues, CO2+H2O forms HCO3-.", "i-T, ii-T, iii-T, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-T, ii-T, iii-F, iv-T", "option1"),

  // FITB
  fitb("Transport of Gases", "About __________ of O2 is transported by RBCs in blood.", "3%", "7%", "97%", "70%", "option3"),
  fitb("Transport of Gases", "About __________ of CO2 is transported as bicarbonate.", "3%", "7%", "20-25%", "70%", "option4"),
  fitb("Transport of Gases", "Each haemoglobin molecule can carry maximum __________ molecules of O2.", "1", "2", "4", "8", "option3"),
  fitb("Transport of Gases", "O2 bound to haemoglobin forms __________.", "carbamino-haemoglobin", "methaemoglobin", "oxyhaemoglobin", "carboxyhaemoglobin", "option3"),
  fitb("Transport of Gases", "The oxygen dissociation curve has a __________ shape.", "linear", "parabolic", "sigmoid", "hyperbolic", "option3"),
  fitb("Transport of Gases", "CO2 carried by haemoglobin forms __________.", "oxyhaemoglobin", "methaemoglobin", "carbamino-haemoglobin", "carboxyhaemoglobin", "option3"),
  fitb("Transport of Gases", "Enzyme catalysing CO2+H2O → HCO3-+H+ is __________.", "amylase", "lipase", "carbonic anhydrase", "catalase", "option3"),
  fitb("Transport of Gases", "100 mL oxygenated blood delivers __________ mL O2 to tissues.", "2", "3", "5", "10", "option3"),
  fitb("Transport of Gases", "100 mL deoxygenated blood delivers __________ mL CO2 to alveoli.", "2", "4", "7", "10", "option2"),
  fitb("Transport of Gases", "At tissue site, CO2 is trapped mainly as __________.", "oxyhaemoglobin", "bicarbonate", "carbonic acid only", "CO2 gas", "option2"),
  fitb("Transport of Gases", "20-25% of CO2 is transported by __________.", "plasma", "WBCs", "RBCs as carbamino-haemoglobin", "platelets", "option3"),
  fitb("Transport of Gases", "In alveoli, carbamino-haemoglobin __________ CO2.", "binds more", "dissociates", "accumulates", "stores", "option2"),

  // ═══════════════════════════════════════════════
  //  14.5 — REGULATION OF RESPIRATION
  // ═══════════════════════════════════════════════

  para(
    "Regulation of Respiration",
    "Human beings have a significant ability to maintain and moderate the respiratory rhythm to suit the demands of the body tissues. This is done by the neural system. A specialised centre present in the medulla region of the brain called respiratory rhythm centre is primarily responsible for this regulation. Another centre present in the pons region of the brain called pneumotaxic centre can moderate the functions of the respiratory rhythm centre. Neural signal from this centre can reduce the duration of inspiration and thereby alter the respiratory rate. A chemosensitive area is situated adjacent to the rhythm centre which is highly sensitive to CO2 and hydrogen ions. Increase in these substances can activate this centre, which in turn can signal the rhythm centre to make necessary adjustments so that these substances can be eliminated. Receptors associated with aortic arch and carotid artery also can recognise changes in CO2 and H+ concentration and send necessary signals to the rhythm centre for remedial actions. The role of oxygen in the regulation of respiratory rhythm is quite insignificant.",
    ["respiratory rhythm centre", "medulla", "pneumotaxic centre", "pons", "chemosensitive area", "CO2", "hydrogen ions", "aortic arch", "carotid artery"]
  ),

  ptr("Regulation of Respiration", "Regulation of Respiration — Key Points", [
    "Regulatory system: Neural system regulates respiratory rhythm.",
    "Respiratory rhythm centre: In medulla region of brain; primarily responsible for regulation.",
    "Pneumotaxic centre: In pons region; reduces duration of inspiration → alters respiratory rate.",
    "Chemosensitive area: Adjacent to rhythm centre; highly sensitive to CO2 and H+.",
    "Action: Increased CO2/H+ activates chemosensitive area → signals rhythm centre → adjustments made.",
    "Peripheral receptors: In aortic arch and carotid artery — detect CO2/H+ → signal rhythm centre.",
    "Role of O2: Quite insignificant in regulation of respiratory rhythm.",
  ]),

  // MCQ
  mcq("Regulation of Respiration", "Respiratory rhythm is regulated by the:", "Circulatory system", "Endocrine system", "Neural system", "Digestive system", "option3"),
  mcq("Regulation of Respiration", "Respiratory rhythm centre is located in the:", "Cerebrum", "Cerebellum", "Medulla region", "Pons region", "option3"),
  mcq("Regulation of Respiration", "Pneumotaxic centre is located in the:", "Cerebrum", "Medulla region", "Pons region", "Spinal cord", "option3"),
  mcq("Regulation of Respiration", "Pneumotaxic centre can:", "Initiate breathing", "Reduce duration of inspiration", "Increase tidal volume", "Stop breathing permanently", "option2"),
  mcq("Regulation of Respiration", "Chemosensitive area is highly sensitive to:", "O2 and N2", "CO2 and H+ ions", "O2 and CO2", "N2 and H+", "option2"),
  mcq("Regulation of Respiration", "Increase in CO2 and H+ concentration:", "Suppresses chemosensitive area", "Activates chemosensitive area", "Has no effect", "Directly stimulates diaphragm", "option2"),
  mcq("Regulation of Respiration", "Receptors that recognise CO2 and H+ changes are associated with:", "Aortic arch and carotid artery", "Pulmonary artery and vein", "Trachea and bronchi", "Alveolar membrane", "option1"),
  mcq("Regulation of Respiration", "The role of O2 in regulation of respiratory rhythm is:", "Very important", "Moderately important", "Quite insignificant", "The most important factor", "option3"),
  mcq("Regulation of Respiration", "The chemosensitive area is located:", "In the pons region", "Adjacent to respiratory rhythm centre", "In the cerebellum", "In the carotid artery", "option2"),
  mcq("Regulation of Respiration", "The pneumotaxic centre alters respiratory rate by:", "Changing tidal volume", "Reducing duration of inspiration", "Increasing RV", "Stimulating the diaphragm directly", "option2"),
  mcq("Regulation of Respiration", "Which centre is primarily responsible for regulation of respiratory rhythm?", "Pneumotaxic centre", "Chemosensitive area", "Respiratory rhythm centre", "Aortic arch receptors", "option3"),
  mcq("Regulation of Respiration", "Aortic arch receptors send signals to:", "The diaphragm directly", "The lungs", "The rhythm centre", "The spinal cord", "option3"),

  // Match
  mtc("Regulation of Respiration", "Match the following:",
    ["Respiratory rhythm centre", "Pneumotaxic centre", "Chemosensitive area", "Aortic arch receptors"],
    ["P. Detects CO2/H+ in blood — sends signals", "Q. Adjacent to rhythm centre — sensitive to CO2/H+", "R. Pons region — reduces inspiration duration", "S. Medulla region — primary regulator"],
    "1-S, 2-R, 3-Q, 4-P", "1-R, 2-S, 3-P, 4-Q", "1-Q, 2-P, 3-R, 4-S", "1-P, 2-Q, 3-S, 4-R", "option1"),
  mtc("Regulation of Respiration", "Match the following:",
    ["Medulla region", "Pons region", "Chemosensitive area", "O2 role in regulation"],
    ["P. Quite insignificant", "Q. Sensitive to CO2 and H+", "R. Location of pneumotaxic centre", "S. Location of rhythm centre"],
    "1-S, 2-R, 3-Q, 4-P", "1-Q, 2-S, 3-P, 4-R", "1-R, 2-Q, 3-S, 4-P", "1-P, 2-R, 3-S, 4-Q", "option1"),
  mtc("Regulation of Respiration", "Match the following:",
    ["CO2 increases", "Pneumotaxic centre fires", "Chemosensitive area activates", "Neural system"],
    ["P. Regulates respiratory rhythm", "Q. Reduces duration of inspiration", "R. Activates chemosensitive area", "S. Signals rhythm centre for adjustment"],
    "1-R, 2-Q, 3-S, 4-P", "1-Q, 2-R, 3-P, 4-S", "1-S, 2-P, 3-Q, 4-R", "1-P, 2-S, 3-R, 4-Q", "option1"),

  // Assertion-Reason
  ar("Regulation of Respiration", "Respiratory rhythm centre is primarily responsible for regulation of breathing.", "It is located in the medulla region of the brain.", "option2"),
  ar("Regulation of Respiration", "Pneumotaxic centre can alter respiratory rate.", "It can reduce the duration of inspiration, thereby changing respiratory rate.", "option1"),
  ar("Regulation of Respiration", "Chemosensitive area is sensitive to CO2 and H+.", "Increase in CO2/H+ activates the chemosensitive area, which then signals the rhythm centre.", "option1"),
  ar("Regulation of Respiration", "O2 plays the most important role in regulating respiratory rhythm.", "O2 receptors in the medulla are highly sensitive.", "option4"),
  ar("Regulation of Respiration", "Receptors in aortic arch detect CO2 changes.", "These receptors send signals to the rhythm centre for remedial action.", "option1"),
  ar("Regulation of Respiration", "Pneumotaxic centre is located in the medulla.", "Pneumotaxic centre moderates the respiratory rhythm centre.", "option3"),
  ar("Regulation of Respiration", "Increased CO2 levels lead to increased rate of breathing.", "High CO2 activates the chemosensitive area, signalling rhythm centre to increase respiratory rate.", "option1"),
  ar("Regulation of Respiration", "Carotid artery receptors are involved in regulation of respiration.", "They detect changes in CO2 and H+ and send signals to the rhythm centre.", "option1"),

  // NCS
  ncs("Regulation of Respiration", "How many of the following statements are CORRECT?", ["Respiratory rhythm centre is in the medulla.", "Pneumotaxic centre is in the pons.", "Chemosensitive area is sensitive to O2.", "O2 plays an insignificant role in respiratory regulation."], "option3"),
  ncs("Regulation of Respiration", "How many of the following statements are CORRECT?", ["Pneumotaxic centre can reduce duration of inspiration.", "Chemosensitive area is adjacent to the rhythm centre.", "Aortic arch receptors detect CO2 and H+.", "Carotid artery receptors send signals to rhythm centre."], "option4"),
  ncs("Regulation of Respiration", "How many of the following statements are CORRECT?", ["O2 is the main factor regulating respiratory rhythm.", "CO2 increase activates the chemosensitive area.", "Neural system regulates respiratory rhythm.", "Pneumotaxic centre is in the medulla."], "option2"),
  ncs("Regulation of Respiration", "How many of the following statements are CORRECT?", ["Chemosensitive area is sensitive to CO2 and H+.", "Aortic arch has receptors for respiratory regulation.", "Pneumotaxic centre increases duration of inspiration.", "Rhythm centre is primarily responsible for regulation."], "option3"),

  // T/F
  tf4("Regulation of Respiration", "Identify whether each statement is True (T) or False (F):\n(i) Respiratory rhythm centre is in medulla.\n(ii) Pneumotaxic centre is in cerebellum.\n(iii) Chemosensitive area detects CO2 and H+.\n(iv) O2 is main regulator of respiratory rhythm.", "i-T, ii-F, iii-T, iv-F", "i-F, ii-T, iii-T, iv-T", "i-T, ii-T, iii-F, iv-T", "i-F, ii-F, iii-T, iv-T", "option1"),
  tf4("Regulation of Respiration", "Identify whether each statement is True (T) or False (F):\n(i) Pneumotaxic centre reduces duration of inspiration.\n(ii) Aortic arch receptors detect CO2/H+.\n(iii) Carotid artery has receptors for respiratory regulation.\n(iv) Chemosensitive area is in the pons.", "i-T, ii-T, iii-T, iv-F", "i-F, ii-T, iii-F, iv-T", "i-T, ii-F, iii-T, iv-T", "i-T, ii-T, iii-F, iv-T", "option1"),
  tf4("Regulation of Respiration", "Identify whether each statement is True (T) or False (F):\n(i) Neural system regulates respiratory rhythm.\n(ii) O2 role in respiratory regulation is insignificant.\n(iii) CO2 increase suppresses chemosensitive area.\n(iv) Rhythm centre adjusts breathing to eliminate excess CO2.", "i-T, ii-T, iii-F, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-F, iii-T, iv-T", "i-T, ii-T, iii-T, iv-F", "option1"),

  // FITB
  fitb("Regulation of Respiration", "Respiratory rhythm is regulated by the __________ system.", "circulatory", "endocrine", "neural", "digestive", "option3"),
  fitb("Regulation of Respiration", "Respiratory rhythm centre is in the __________ region.", "cerebrum", "cerebellum", "pons", "medulla", "option4"),
  fitb("Regulation of Respiration", "Pneumotaxic centre is located in the __________ region.", "medulla", "cerebrum", "pons", "cerebellum", "option3"),
  fitb("Regulation of Respiration", "Pneumotaxic centre reduces the __________ of inspiration.", "volume", "rate", "duration", "depth", "option3"),
  fitb("Regulation of Respiration", "Chemosensitive area is highly sensitive to CO2 and __________.", "O2", "N2", "hydrogen ions", "bicarbonate", "option3"),
  fitb("Regulation of Respiration", "Receptors in the __________ and carotid artery detect CO2/H+.", "pulmonary artery", "aortic arch", "trachea", "alveoli", "option2"),
  fitb("Regulation of Respiration", "Role of __________ in regulation of respiratory rhythm is quite insignificant.", "CO2", "H+", "O2", "N2", "option3"),
  fitb("Regulation of Respiration", "Increase in CO2/H+ __________ the chemosensitive area.", "suppresses", "destroys", "activates", "has no effect on", "option3"),

  // ═══════════════════════════════════════════════
  //  14.6 — DISORDERS OF RESPIRATORY SYSTEM
  // ═══════════════════════════════════════════════

  para(
    "Disorders of Respiratory System",
    "Asthma: A difficulty in breathing causing wheezing due to inflammation of bronchi and bronchioles. Emphysema: A chronic disorder in which alveolar walls are damaged due to which respiratory surface is decreased. One of the major causes of this is cigarette smoking. Occupational Respiratory Disorders: In certain industries, especially those involving grinding or stone-breaking, so much dust is produced that the defence mechanism of the body cannot fully cope. Long exposure gives rise to inflammation leading to fibrosis (proliferation of fibrous tissues) and thus serious lung damage. Workers in such industries should wear protective masks.",
    ["asthma", "emphysema", "fibrosis", "bronchi", "bronchioles", "alveolar walls", "cigarette smoking", "protective masks", "occupational", "wheezing"]
  ),

  ptr("Disorders of Respiratory System", "Disorders of Respiratory System — Key Points", [
    "Asthma: Difficulty in breathing + wheezing; due to inflammation of bronchi and bronchioles.",
    "Emphysema: Chronic disorder; alveolar walls damaged; respiratory surface decreased; major cause: cigarette smoking.",
    "Occupational disorders cause: Excessive dust in grinding/stone-breaking industries overwhelms body defence.",
    "Pathology: Long-term dust exposure → inflammation → fibrosis (proliferation of fibrous tissue) → serious lung damage.",
    "Prevention: Workers must wear protective masks.",
  ]),

  // MCQ
  mcq("Disorders of Respiratory System", "Asthma is caused by inflammation of:", "Alveoli", "Trachea", "Bronchi and bronchioles", "Pleura", "option3"),
  mcq("Disorders of Respiratory System", "Characteristic symptom of asthma is:", "Coughing blood", "Wheezing", "Fever", "Fibrosis", "option2"),
  mcq("Disorders of Respiratory System", "Emphysema involves damage to:", "Bronchi", "Trachea", "Alveolar walls", "Pleura", "option3"),
  mcq("Disorders of Respiratory System", "Emphysema leads to:", "Increased respiratory surface", "Decreased respiratory surface", "Inflammation of bronchi", "Normal lung function", "option2"),
  mcq("Disorders of Respiratory System", "One major cause of emphysema is:", "Dust inhalation only", "Viral infection", "Cigarette smoking", "Genetic mutation", "option3"),
  mcq("Disorders of Respiratory System", "Occupational respiratory disorders are caused by excessive:", "Noise", "Dust", "Heat", "Light", "option2"),
  mcq("Disorders of Respiratory System", "Industries causing occupational disorders involve:", "Painting or printing", "Grinding or stone-breaking", "Cooking or baking", "Farming or gardening", "option2"),
  mcq("Disorders of Respiratory System", "Long exposure to industrial dust leads to:", "Asthma directly", "Emphysema only", "Inflammation leading to fibrosis", "Pulmonary oedema", "option3"),
  mcq("Disorders of Respiratory System", "Proliferation of fibrous tissues in lungs is called:", "Emphysema", "Asthma", "Fibrosis", "Pneumonia", "option3"),
  mcq("Disorders of Respiratory System", "Workers in grinding industries should wear:", "Gloves", "Helmets", "Protective masks", "Goggles", "option3"),
  mcq("Disorders of Respiratory System", "Emphysema is described in NCERT as a __________ disorder.", "acute", "temporary", "chronic", "minor", "option3"),
  mcq("Disorders of Respiratory System", "In occupational disorders, the body's __________ cannot fully cope with the dust.", "immune system", "nervous system", "defence mechanism", "digestive system", "option3"),

  // Match
  mtc("Disorders of Respiratory System", "Match the following:",
    ["Asthma", "Emphysema", "Fibrosis", "Cigarette smoking"],
    ["P. Proliferation of fibrous tissue in lungs", "Q. Major cause of emphysema", "R. Chronic disorder — alveolar walls damaged, respiratory surface decreased", "S. Inflammation of bronchi and bronchioles causing wheezing"],
    "1-S, 2-R, 3-P, 4-Q", "1-R, 2-S, 3-Q, 4-P", "1-Q, 2-P, 3-R, 4-S", "1-P, 2-Q, 3-S, 4-R", "option1"),
  mtc("Disorders of Respiratory System", "Match the following:",
    ["Wheezing", "Alveolar wall damage", "Protective masks", "Grinding industries"],
    ["P. Source of dust causing occupational lung disorders", "Q. Prevention for occupational disorders", "R. Result of emphysema", "S. Symptom of asthma"],
    "1-S, 2-R, 3-Q, 4-P", "1-R, 2-S, 3-P, 4-Q", "1-Q, 2-P, 3-S, 4-R", "1-P, 2-Q, 3-R, 4-S", "option1"),
  mtc("Disorders of Respiratory System", "Match the following:",
    ["Inflammation of bronchi", "Decreased respiratory surface", "Long exposure to dust", "Proliferation of fibrous tissue"],
    ["P. Fibrosis", "Q. Emphysema", "R. Leads to fibrosis and serious lung damage", "S. Asthma"],
    "1-S, 2-Q, 3-R, 4-P", "1-Q, 2-S, 3-P, 4-R", "1-R, 2-P, 3-S, 4-Q", "1-P, 2-R, 3-Q, 4-S", "option1"),

  // Assertion-Reason
  ar("Disorders of Respiratory System", "Asthma causes difficulty in breathing.", "Asthma involves inflammation of bronchi and bronchioles, leading to wheezing.", "option1"),
  ar("Disorders of Respiratory System", "Emphysema reduces the respiratory surface.", "Emphysema involves damage to alveolar walls.", "option1"),
  ar("Disorders of Respiratory System", "Cigarette smoking is a major cause of asthma.", "Cigarette smoking is mainly associated with emphysema according to NCERT.", "option3"),
  ar("Disorders of Respiratory System", "Workers in grinding industries should wear protective masks.", "Industrial dust can cause fibrosis leading to serious lung damage.", "option1"),
  ar("Disorders of Respiratory System", "Occupational respiratory disorders are caused by excessive dust.", "The body's defence mechanism cannot fully cope with prolonged dust exposure.", "option1"),
  ar("Disorders of Respiratory System", "Fibrosis causes serious lung damage.", "Fibrosis refers to proliferation of fibrous tissues in the lungs.", "option1"),
  ar("Disorders of Respiratory System", "Emphysema is an acute disorder.", "Emphysema is described as a chronic disorder by NCERT.", "option4"),
  ar("Disorders of Respiratory System", "Asthma involves inflammation of alveolar walls.", "Asthma involves inflammation of bronchi and bronchioles, not alveolar walls.", "option4"),

  // NCS
  ncs("Disorders of Respiratory System", "How many of the following statements are CORRECT?", ["Asthma involves inflammation of bronchi and bronchioles.", "Emphysema involves damage to alveolar walls.", "Cigarette smoking is a major cause of emphysema.", "Asthma causes fibrosis."], "option3"),
  ncs("Disorders of Respiratory System", "How many of the following statements are CORRECT?", ["Occupational disorders are caused by excessive dust.", "Long exposure causes inflammation leading to fibrosis.", "Workers should wear protective masks.", "Grinding industries only cause asthma."], "option3"),
  ncs("Disorders of Respiratory System", "How many of the following statements are CORRECT?", ["Wheezing is a symptom of asthma.", "Emphysema decreases the respiratory surface.", "Fibrosis is proliferation of fibrous tissues.", "Emphysema is an acute disorder."], "option3"),
  ncs("Disorders of Respiratory System", "How many of the following statements are CORRECT?", ["Cigarette smoking causes emphysema.", "Asthma causes wheezing.", "Fibrosis causes serious lung damage.", "All respiratory disorders are caused by cigarette smoking."], "option3"),

  // T/F
  tf4("Disorders of Respiratory System", "Identify whether each statement is True (T) or False (F):\n(i) Asthma causes wheezing.\n(ii) Emphysema increases respiratory surface.\n(iii) Cigarette smoking causes emphysema.\n(iv) Asthma involves inflammation of alveoli.", "i-T, ii-F, iii-T, iv-F", "i-F, ii-T, iii-F, iv-T", "i-T, ii-T, iii-T, iv-F", "i-F, ii-F, iii-T, iv-T", "option1"),
  tf4("Disorders of Respiratory System", "Identify whether each statement is True (T) or False (F):\n(i) Fibrosis = proliferation of fibrous tissue.\n(ii) Industrial dust causes respiratory disorders.\n(iii) Protective masks prevent occupational disorders.\n(iv) Emphysema is caused by asthma.", "i-T, ii-T, iii-T, iv-F", "i-F, ii-T, iii-T, iv-T", "i-T, ii-F, iii-T, iv-F", "i-T, ii-T, iii-F, iv-T", "option1"),
  tf4("Disorders of Respiratory System", "Identify whether each statement is True (T) or False (F):\n(i) Asthma involves bronchi and bronchiole inflammation.\n(ii) Emphysema is an acute disorder.\n(iii) Major cause of emphysema is cigarette smoking.\n(iv) Workers in stone-breaking industries risk lung damage.", "i-T, ii-F, iii-T, iv-T", "i-F, ii-T, iii-T, iv-F", "i-T, ii-T, iii-F, iv-T", "i-F, ii-F, iii-T, iv-T", "option1"),

  // FITB
  fitb("Disorders of Respiratory System", "Asthma causes difficulty in breathing and __________.", "coughing blood", "fever", "wheezing", "fibrosis", "option3"),
  fitb("Disorders of Respiratory System", "Asthma is caused by inflammation of __________.", "alveoli and pleura", "bronchi and bronchioles", "trachea and larynx", "nostrils and pharynx", "option2"),
  fitb("Disorders of Respiratory System", "Emphysema is a __________ disorder of the lungs.", "acute", "temporary", "chronic", "minor", "option3"),
  fitb("Disorders of Respiratory System", "In emphysema, __________ are damaged.", "bronchi", "bronchioles", "alveolar walls", "trachea", "option3"),
  fitb("Disorders of Respiratory System", "Emphysema results in __________ of the respiratory surface.", "increase", "no change", "decrease", "doubling", "option3"),
  fitb("Disorders of Respiratory System", "A major cause of emphysema is __________.", "alcohol consumption", "cigarette smoking", "dust inhalation only", "viral infection", "option2"),
  fitb("Disorders of Respiratory System", "Occupational respiratory disorders arise from industries involving __________.", "painting or printing", "grinding or stone-breaking", "cooking or baking", "farming", "option2"),
  fitb("Disorders of Respiratory System", "Long exposure to dust causes inflammation leading to __________.", "asthma", "emphysema only", "fibrosis", "pneumonia", "option3"),
  fitb("Disorders of Respiratory System", "Fibrosis is the proliferation of __________ in the lungs.", "nervous tissue", "muscular tissue", "fibrous tissue", "epithelial tissue", "option3"),
  fitb("Disorders of Respiratory System", "To prevent occupational lung disorders, workers should wear __________.", "gloves", "helmets", "protective masks", "goggles", "option3"),
];
