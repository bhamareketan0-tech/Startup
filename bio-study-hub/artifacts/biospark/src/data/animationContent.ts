export type AnimFrame = {
  title: string;
  narration: string;
  keyPoints: string[];
  visual: "lungs" | "cell" | "flow" | "cycle" | "dna" | "brain" | "heart" | "generic" | "molecules" | "compare";
};

export type SubunitAnim = {
  subunit: string;
  frames: AnimFrame[];
};

export type ChapterAnim = {
  chapterId: string;
  color: string;
  icon: string;
  subunits: SubunitAnim[];
};

const genericSubunit = (subunit: string, chapterName: string): SubunitAnim => ({
  subunit,
  frames: [
    {
      title: subunit,
      narration: `Welcome to the topic: ${subunit}, part of ${chapterName}. This section covers key biological concepts from your NCERT textbook that are frequently tested in NEET examinations. Pay close attention to the definitions, mechanisms, and key facts presented here.`,
      keyPoints: [
        `Study ${subunit} from NCERT Class 11/12 Biology`,
        "Focus on diagrams and labeled parts",
        "Note all NEET-relevant terms and definitions",
      ],
      visual: "generic",
    },
    {
      title: `Key Concepts — ${subunit}`,
      narration: `The concept of ${subunit} is fundamental to understanding ${chapterName}. In your NEET examination, questions from this topic often test your understanding of mechanisms, structures, and their functional significance. Make sure to revise all NCERT diagrams carefully.`,
      keyPoints: [
        "Read the full NCERT text for this subtopic",
        "Understand the biological significance",
        "Revise previous year NEET questions",
      ],
      visual: "generic",
    },
  ],
});

export const animationData: ChapterAnim[] = [
  {
    chapterId: "breathing-and-exchange-of-gases",
    color: "#00FF9D",
    icon: "🫁",
    subunits: [
      {
        subunit: "Introduction to Breathing and Respiration",
        frames: [
          {
            title: "Why Do We Breathe?",
            narration: "All living organisms need energy to perform life activities. This energy is obtained by breaking down simple molecules like glucose, amino acids, and fatty acids using oxygen. The process produces carbon dioxide as a by-product. Oxygen must be continuously supplied to cells, and carbon dioxide must be continuously removed. This is why breathing is essential for survival.",
            keyPoints: [
              "Oxygen is needed for catabolic reactions that release energy",
              "CO₂ is a harmful by-product that must be removed",
              "Breathing ≠ Respiration — breathing is the mechanical exchange of gases",
              "O₂ indirectly participates in ATP synthesis",
            ],
            visual: "lungs",
          },
          {
            title: "Breathing vs Respiration",
            narration: "Breathing is commonly called respiration, but they are different. Breathing refers to the mechanical process of inhaling oxygen-rich air and exhaling carbon dioxide-rich air. Respiration, on the other hand, is the biochemical process inside cells where glucose is oxidised to release energy in the form of ATP. Remember: Breathing is mechanical; Respiration is biochemical.",
            keyPoints: [
              "Breathing = Mechanical process (lungs expanding and contracting)",
              "Cellular Respiration = Chemical process (glucose → ATP)",
              "Breathing involves exchange of O₂ from atmosphere with CO₂ from cells",
              "Organisms use different organs for breathing (gills, lungs, skin, tracheae)",
            ],
            visual: "flow",
          },
        ],
      },
      {
        subunit: "Respiratory Organs",
        frames: [
          {
            title: "Respiratory Organs Across Organisms",
            narration: "Different organisms have evolved different respiratory organs based on their environment. Lower invertebrates like sponges, hydra, and earthworms exchange gases directly through their body surface. Cockroaches breathe through spiracles and tracheae. Most aquatic arthropods and fishes use gills. Terrestrial organisms like amphibians can breathe through skin and lungs. Reptiles, birds, and mammals use lungs exclusively.",
            keyPoints: [
              "Sponges, Hydra, Earthworm → Body surface (simple diffusion)",
              "Insects (Cockroach) → Tracheae and Spiracles",
              "Aquatic animals (Fish) → Gills",
              "Amphibians → Skin + Lungs (bimodal breathing)",
              "Reptiles, Birds, Mammals → Only Lungs",
            ],
            visual: "compare",
          },
          {
            title: "Human Respiratory System",
            narration: "The human respiratory system consists of the external nostrils, nasal cavity, pharynx, larynx, trachea, bronchi, bronchioles, and alveoli. The trachea is supported by C-shaped cartilaginous rings to keep it open. The lungs are housed in the thoracic cavity enclosed by the rib cage. Each lung is covered by pleural membranes with pleural fluid to reduce friction. The alveoli are the actual sites of gas exchange.",
            keyPoints: [
              "Trachea has C-shaped incomplete cartilaginous rings",
              "Right lung has 3 lobes; Left lung has 2 lobes",
              "300 million alveoli per lung → huge surface area (~80 m²)",
              "Alveoli are the actual sites of gas exchange",
              "Pleural fluid reduces friction during breathing",
            ],
            visual: "lungs",
          },
        ],
      },
      {
        subunit: "Human Respiratory System",
        frames: [
          {
            title: "Anatomy of the Human Respiratory System",
            narration: "The human respiratory system is a sophisticated set of organs that facilitate the exchange of oxygen and carbon dioxide. Air enters through the nostrils, passes through the nasal cavity where it is filtered and warmed, then moves through the pharynx, larynx, and into the trachea. The trachea divides into two bronchi — one for each lung. These bronchi branch further into bronchioles and end in tiny air sacs called alveoli, where actual gas exchange occurs.",
            keyPoints: [
              "Pathway: Nostrils → Nasal cavity → Pharynx → Larynx → Trachea → Bronchi → Bronchioles → Alveoli",
              "Trachea: held open by C-shaped cartilaginous rings (incomplete posteriorly)",
              "Right lung: 3 lobes (superior, middle, inferior)",
              "Left lung: 2 lobes (superior, inferior) — cardiac notch accommodates heart",
              "Each lung: ~300 million alveoli → surface area ~80 m²",
              "Pleural membranes surround each lung; pleural fluid reduces friction",
            ],
            visual: "lungs",
          },
          {
            title: "Alveoli — The Site of Gas Exchange",
            narration: "Alveoli are tiny balloon-like sacs at the end of bronchioles. Each alveolus is surrounded by a dense network of pulmonary capillaries. The walls of alveoli are extremely thin — just one cell thick — made of squamous epithelium, allowing rapid diffusion of gases. The total surface area provided by all alveoli in both lungs is approximately 80 square metres, equivalent to half a tennis court, enabling efficient gas exchange.",
            keyPoints: [
              "Alveoli = tiny air sacs at end of bronchioles",
              "Wall: single squamous epithelial cell layer (extremely thin)",
              "Surrounded by dense pulmonary capillary network",
              "Surfactant (from Type II pneumocytes) prevents alveolar collapse",
              "Total surface area ≈ 80 m² for efficient gas exchange",
            ],
            visual: "lungs",
          },
        ],
      },
      {
        subunit: "Mechanism of Breathing",
        frames: [
          {
            title: "Inspiration (Breathing In)",
            narration: "Inspiration is an active process. When we inhale, the diaphragm contracts and flattens, moving downward. Simultaneously, the external intercostal muscles contract, pulling the ribs upward and outward. This increases the volume of the thoracic cavity, which decreases the pressure inside. Since atmospheric pressure is now greater than lung pressure, air rushes into the lungs. Normal inspiration lasts about 2 seconds.",
            keyPoints: [
              "Diaphragm contracts → moves downward",
              "External intercostal muscles contract → ribs move up and out",
              "Thoracic volume ↑ → Intrapulmonary pressure ↓",
              "Air flows IN (high → low pressure)",
              "Inspiration is an ACTIVE process requiring muscle energy",
            ],
            visual: "lungs",
          },
          {
            title: "Expiration (Breathing Out)",
            narration: "Expiration is largely a passive process. The diaphragm and external intercostal muscles relax, causing the thoracic cavity to decrease in volume. This increases the pressure inside the lungs above atmospheric pressure, forcing air out. During forced expiration, the internal intercostal muscles and abdominal muscles actively contract to push air out more forcefully, as happens during exercise or coughing.",
            keyPoints: [
              "Diaphragm relaxes → moves upward",
              "External intercostal muscles relax → ribs move down and in",
              "Thoracic volume ↓ → Intrapulmonary pressure ↑",
              "Air flows OUT (high → low pressure)",
              "Normal expiration is PASSIVE; Forced expiration is active",
            ],
            visual: "lungs",
          },
          {
            title: "Pulmonary Volumes and Capacities",
            narration: "Pulmonary function is measured using spirometry. Tidal Volume is the amount of air breathed in or out in one normal breath — about 500 mL. Inspiratory Reserve Volume is the additional air that can be forcibly inhaled — about 3000 mL. Expiratory Reserve Volume is the additional air that can be forcibly exhaled — about 1100 mL. Residual Volume of about 1200 mL always remains in the lungs and cannot be expelled.",
            keyPoints: [
              "Tidal Volume (TV) = 500 mL (normal breath)",
              "Inspiratory Reserve Volume (IRV) = 3000 mL",
              "Expiratory Reserve Volume (ERV) = 1100 mL",
              "Residual Volume (RV) = 1200 mL (cannot be exhaled)",
              "Vital Capacity = IRV + TV + ERV = 4600 mL",
              "Total Lung Capacity = VC + RV = 5800 mL",
            ],
            visual: "compare",
          },
        ],
      },
      {
        subunit: "Pulmonary Volumes and Capacities",
        frames: [
          {
            title: "Measuring Lung Volumes",
            narration: "Pulmonary volumes are measured using a spirometer. Tidal Volume is the air inhaled or exhaled in one normal breath — about 500 mL. Inspiratory Reserve Volume is the extra air you can forcibly inhale after a normal breath — about 3000 mL. Expiratory Reserve Volume is the extra air you can forcibly exhale — about 1100 mL. Residual Volume is the air that always remains in the lungs even after maximum exhalation — about 1200 mL, preventing alveolar collapse.",
            keyPoints: [
              "Tidal Volume (TV) = 500 mL — normal quiet breathing",
              "Inspiratory Reserve Volume (IRV) = 3000 mL",
              "Expiratory Reserve Volume (ERV) = 1100 mL",
              "Residual Volume (RV) = 1200 mL — cannot be expelled",
              "Dead Space = ~150 mL (air in conducting zone, no exchange)",
            ],
            visual: "compare",
          },
          {
            title: "Lung Capacities",
            narration: "Lung capacities are calculated by combining two or more volumes. Inspiratory Capacity equals Tidal Volume plus Inspiratory Reserve Volume, totalling 3500 mL. Expiratory Capacity equals Tidal Volume plus Expiratory Reserve Volume, totalling 1600 mL. Functional Residual Capacity equals Expiratory Reserve Volume plus Residual Volume, totalling 2300 mL. Vital Capacity is the maximum air that can be exhaled after a maximum inhalation — IRV plus TV plus ERV, totalling 4600 mL. Total Lung Capacity is all volumes combined at 5800 mL.",
            keyPoints: [
              "Inspiratory Capacity (IC) = TV + IRV = 3500 mL",
              "Functional Residual Capacity (FRC) = ERV + RV = 2300 mL",
              "Vital Capacity (VC) = IRV + TV + ERV = 4600 mL",
              "Total Lung Capacity (TLC) = VC + RV = 5800 mL",
              "Forced Expiratory Volume (FEV₁) used in clinical diagnosis",
            ],
            visual: "compare",
          },
        ],
      },
      {
        subunit: "Exchange of Gases",
        frames: [
          {
            title: "Diffusion — The Principle",
            narration: "Gas exchange occurs by simple diffusion — gases move from areas of high partial pressure to areas of low partial pressure. This happens at two sites: the alveolar membrane between alveoli and pulmonary capillaries, and the tissue level where gases exchange between systemic capillaries and body cells. The thin alveolar membrane of just 1 millimeter thickness allows rapid diffusion.",
            keyPoints: [
              "Gases diffuse from HIGH to LOW partial pressure",
              "Exchange occurs at: (1) Alveolar membrane, (2) Tissue level",
              "Alveolar membrane is extremely thin for rapid diffusion",
              "Solubility of CO₂ in blood is 20-25 times more than O₂",
              "Despite lower pressure gradient, CO₂ diffuses rapidly",
            ],
            visual: "flow",
          },
          {
            title: "Partial Pressures of Gases",
            narration: "The partial pressure of oxygen in alveoli is 104 mmHg, while in deoxygenated blood entering the lungs it is only 40 mmHg. This gradient drives oxygen from alveoli into blood. The partial pressure of CO₂ in deoxygenated blood is 45 mmHg, while in alveoli it is only 40 mmHg, so CO₂ diffuses out of blood into alveoli. At the tissue level, the partial pressure of O₂ in cells is 40 mmHg and in arterial blood it is 95 mmHg, driving O₂ into cells.",
            keyPoints: [
              "pO₂: Alveoli 104 > Deoxygenated blood 40 → O₂ enters blood",
              "pCO₂: Blood 45 > Alveoli 40 → CO₂ leaves blood",
              "pO₂: Arterial blood 95 > Tissue cells 40 → O₂ enters cells",
              "pCO₂: Cells 45 > Venous blood 40 → CO₂ enters blood",
            ],
            visual: "molecules",
          },
        ],
      },
      {
        subunit: "Transport of Gases",
        frames: [
          {
            title: "Oxygen Transport",
            narration: "About 97% of oxygen in blood is transported by haemoglobin inside red blood cells as oxyhaemoglobin. Only 3% is dissolved in plasma. Haemoglobin has a very high affinity for oxygen in the lungs where pO₂ is high, forming oxyhaemoglobin. In tissues where pO₂ is low and pCO₂ is high, oxyhaemoglobin dissociates and releases oxygen to the cells. Each haemoglobin molecule can carry 4 oxygen molecules since it has 4 haem groups.",
            keyPoints: [
              "97% O₂ transported as Oxyhaemoglobin (HbO₂) in RBCs",
              "3% O₂ dissolved in plasma",
              "Each Hb carries 4 O₂ molecules (4 haem groups)",
              "High pO₂ → Hb binds O₂ (in lungs)",
              "Low pO₂ + High pCO₂ → Hb releases O₂ (in tissues)",
            ],
            visual: "flow",
          },
          {
            title: "Carbon Dioxide Transport",
            narration: "Carbon dioxide is transported in three ways. About 70% is transported as bicarbonate ions in the plasma after reacting with water inside RBCs in the presence of carbonic anhydrase enzyme. About 23% is carried as carbamino-haemoglobin, bound to the globin part of haemoglobin. Only 7% is dissolved as CO₂ in plasma. The bicarbonate ions are transported in plasma while the hydrogen ions are buffered by haemoglobin, maintaining blood pH.",
            keyPoints: [
              "70% as Bicarbonate ions (HCO₃⁻) in plasma",
              "23% as Carbamino-haemoglobin (bound to Hb)",
              "7% dissolved as CO₂ in plasma",
              "Enzyme Carbonic Anhydrase catalyses: CO₂ + H₂O ⇌ H₂CO₃",
              "H₂CO₃ → H⁺ + HCO₃⁻ (bicarbonate formed in RBC, moves to plasma)",
            ],
            visual: "molecules",
          },
          {
            title: "Oxygen Dissociation Curve",
            narration: "The oxygen dissociation curve is a sigmoid or S-shaped curve that shows the relationship between pO₂ and percentage saturation of haemoglobin with oxygen. At high pO₂ in lungs, haemoglobin is nearly fully saturated. At low pO₂ in tissues, Hb releases oxygen. The curve shifts to the right with increased CO₂, decreased pH, or increased temperature — the Bohr Effect. This ensures more oxygen is released to active tissues.",
            keyPoints: [
              "Sigmoid (S-shaped) curve = cooperative binding of O₂ to Hb",
              "Bohr Effect: ↑CO₂ / ↓pH / ↑Temp → curve shifts RIGHT",
              "Right shift = lower O₂ affinity = more O₂ released to tissues",
              "At lung pO₂ (104 mmHg): Hb is ~97% saturated",
              "At tissue pO₂ (40 mmHg): Hb drops to ~70% saturation",
            ],
            visual: "compare",
          },
        ],
      },
      {
        subunit: "Regulation of Respiration",
        frames: [
          {
            title: "Neural Control of Breathing",
            narration: "Breathing is primarily controlled by the respiratory rhythm centre located in the medulla oblongata of the brain. This centre generates the basic rhythm of breathing. The pneumotaxic centre in the pons region of the brain can moderate the function of the respiratory rhythm centre, reducing the duration of inspiration and altering the respiratory rate. There is also an apneustic centre in the pons that stimulates the inspiratory area.",
            keyPoints: [
              "Respiratory Rhythm Centre = Medulla oblongata (primary control)",
              "Pneumotaxic Centre = Pons (moderates rhythm, ↓ inspiration duration)",
              "Apneustic Centre = Pons (stimulates inspiration)",
              "These centres coordinate to produce normal 12-20 breaths/min",
            ],
            visual: "brain",
          },
          {
            title: "Chemical Regulation",
            narration: "Chemoreceptors in the brain and peripheral arteries detect changes in blood levels of CO₂, O₂, and hydrogen ions. Rising CO₂ levels and falling pH are the strongest signals for increasing breathing rate. The chemosensitive area in the medulla is highly sensitive to CO₂ and H⁺ changes. Interestingly, low O₂ is a weaker signal compared to high CO₂ for regulating breathing rate.",
            keyPoints: [
              "Chemoreceptors detect: CO₂, O₂, and H⁺ (pH) levels",
              "↑CO₂ / ↓pH → stimulates medulla → ↑ breathing rate",
              "CO₂ is the PRIMARY chemical stimulus for breathing rate",
              "O₂ levels are a secondary (weaker) stimulus",
              "Peripheral chemoreceptors in aortic and carotid bodies",
            ],
            visual: "brain",
          },
        ],
      },
      {
        subunit: "Disorders of Respiratory System",
        frames: [
          {
            title: "Asthma and Emphysema",
            narration: "Asthma is a respiratory disorder caused by inflammation and narrowing of the bronchi and bronchioles, leading to difficulty in breathing and wheezing. It is often triggered by allergens, cold air, or exercise. Emphysema is a chronic disorder where the alveolar walls are damaged due to loss of elasticity, leading to reduced gas exchange surface. It is primarily caused by cigarette smoking and leads to breathlessness.",
            keyPoints: [
              "Asthma = Inflammation of bronchi/bronchioles → wheezing",
              "Asthma triggered by allergens, smoke, exercise",
              "Emphysema = Damage to alveolar walls → ↓ gas exchange area",
              "Emphysema mainly caused by cigarette smoking",
              "Both cause breathlessness and reduced oxygen supply",
            ],
            visual: "compare",
          },
          {
            title: "Occupational Respiratory Diseases",
            narration: "Prolonged exposure to dust particles in certain occupations can cause serious respiratory diseases. Silicosis is caused by silicon dioxide dust particles accumulating in the lungs. Asbestosis is caused by asbestos dust. Black lung disease or pneumoconiosis is caused by coal dust. These particles accumulate in lung tissue over years, causing inflammation, fibrosis, and reduced lung capacity. Workers in mining, stone-cutting, and asbestos industries are most affected.",
            keyPoints: [
              "Silicosis → Silicon/quartz dust (stone cutters, miners)",
              "Asbestosis → Asbestos fibres (insulation workers)",
              "Pneumoconiosis → Coal dust (coal miners)",
              "All cause: fibrosis of lung tissue and reduced capacity",
              "Prevention: dust masks, proper ventilation, regular health checks",
            ],
            visual: "compare",
          },
        ],
      },
    ],
  },
  {
    chapterId: "the-living-world",
    color: "#a3e635",
    icon: "🌿",
    subunits: [
      {
        subunit: "Introduction",
        frames: [{ title: "The Living World — Introduction", narration: "The living world is incredibly diverse. Millions of plants, animals, fungi and microbes exist on Earth. Living organisms share common characteristics that distinguish them from non-living matter. Biology is the science of life, and understanding what makes something 'alive' is the foundation of all biological knowledge.", keyPoints: ["Biology = science of life", "Enormous diversity exists in living organisms", "All organisms share certain common characteristics", "NEET heavily tests taxonomy and classification from this chapter"], visual: "generic" }],
      },
      {
        subunit: "What is Living?",
        frames: [{ title: "Defining Life", narration: "Living organisms are distinguished by growth, metabolism, cellular organisation, reproduction, response to stimuli, and homeostasis. Metabolism is the most fundamental characteristic unique to living organisms. Even dead organisms are made of the same chemicals as living ones, but metabolism stops at death. Growth in living organisms is from inside — intrinsic growth — unlike non-living crystals which grow by addition from outside.", keyPoints: ["Metabolism = most fundamental property of life", "Growth in living = intrinsic (from within), not extrinsic", "Consciousness / cognitive ability = defining property of living", "Reproduction not a defining characteristic (mules cannot reproduce)"], visual: "cell" }],
      },
      ...["Diversity in the Living World", "Taxonomic Categories", "Taxonomical Aids"].map(s => genericSubunit(s, "The Living World")),
    ],
  },
  {
    chapterId: "biological-classification",
    color: "#34d399",
    icon: "🔬",
    subunits: [
      {
        subunit: "Introduction",
        frames: [{ title: "Five Kingdom Classification", narration: "R.H. Whittaker proposed the Five Kingdom Classification in 1969, grouping all living organisms into Monera, Protista, Fungi, Plantae, and Animalia. This classification is based on complexity of cell structure, organisation of body, mode of nutrition, and phylogenetic relationships. Before this, organisms were classified into just two kingdoms: Plantae and Animalia by Linnaeus.", keyPoints: ["Whittaker (1969) → 5 Kingdoms", "Kingdoms: Monera, Protista, Fungi, Plantae, Animalia", "Linnaeus originally proposed 2 kingdoms", "Based on: cell type, body organisation, nutrition mode"], visual: "compare" }],
      },
      {
        subunit: "Kingdom Monera",
        frames: [{ title: "Kingdom Monera — Bacteria", narration: "Monerans are the most abundant micro-organisms on Earth. They are all prokaryotes — no membrane-bound nucleus or organelles. They show the most extensive metabolic diversity of all kingdoms. Bacteria can be autotrophic (photosynthetic or chemosynthetic) or heterotrophic. Archaebacteria include extreme halophiles, thermoacidophiles, and methanogens. Eubacteria include cyanobacteria, chemosynthetic autotrophs, and heterotrophic bacteria.", keyPoints: ["Monerans = Prokaryotes (no membrane-bound nucleus)", "Most metabolically diverse kingdom", "Archaebacteria: halophiles, thermoacidophiles, methanogens", "Eubacteria: cyanobacteria, mycoplasma, heterotrophs", "Cell wall in bacteria: not made of cellulose (made of peptidoglycan)"], visual: "cell" }],
      },
      ...["Kingdom Protista", "Kingdom Fungi", "Kingdom Plantae", "Kingdom Animalia", "Viruses, Viroids and Lichens"].map(s => genericSubunit(s, "Biological Classification")),
    ],
  },
  {
    chapterId: "plant-kingdom",
    color: "#4ade80",
    icon: "🌱",
    subunits: [
      {
        subunit: "Introduction",
        frames: [{ title: "Plant Kingdom Overview", narration: "The plant kingdom includes all multicellular, eukaryotic, photosynthetic organisms with cell walls made of cellulose. Plants are classified into algae, bryophytes, pteridophytes, gymnosperms, and angiosperms. The classification is based on presence or absence of vascular tissue, seeds, and flowers. This represents an evolutionary progression from simple aquatic plants to complex flowering plants.", keyPoints: ["Algae → Bryophytes → Pteridophytes → Gymnosperms → Angiosperms (evolutionary sequence)", "Algae: no vascular tissue, no embryo", "Bryophytes: no vascular tissue, has embryo", "Pteridophytes: first true vascular plants", "Gymnosperms: naked seeds; Angiosperms: enclosed seeds"], visual: "generic" }],
      },
      ...["Algae", "Bryophytes", "Pteridophytes", "Gymnosperms", "Angiosperms", "Plant Life Cycles and Alternation of Generations"].map(s => genericSubunit(s, "Plant Kingdom")),
    ],
  },
  {
    chapterId: "animal-kingdom",
    color: "#f59e0b",
    icon: "🐾",
    subunits: [
      {
        subunit: "Introduction",
        frames: [{ title: "Animal Kingdom — Basis of Classification", narration: "Animals are multicellular, eukaryotic, heterotrophic organisms that lack cell walls. The animal kingdom is classified based on grades of organisation (cellular, tissue, organ, organ system), symmetry (asymmetry, radial, bilateral), coelom (acoelomate, pseudocoelomate, coelomate), segmentation, and notochord presence. These criteria define the major animal phyla.", keyPoints: ["All animals: multicellular, eukaryotic, heterotrophic", "Classification based on: symmetry, coelom, segmentation, notochord", "Notochord present → Phylum Chordata", "Bilateral symmetry most common in higher animals", "Coelom = fluid-filled body cavity between body wall and gut"], visual: "compare" }],
      },
      ...["Basis of Classification", "Porifera", "Coelenterata", "Platyhelminthes", "Aschelminthes", "Annelida", "Arthropoda", "Mollusca", "Echinodermata", "Hemichordata", "Chordata"].map(s => genericSubunit(s, "Animal Kingdom")),
    ],
  },
  ...["morphology-of-flowering-plants", "anatomy-of-flowering-plants", "structural-organisation-animals"].map(id => ({
    chapterId: id,
    color: "#818cf8",
    icon: "🌸",
    subunits: [] as SubunitAnim[],
  })),
  {
    chapterId: "cell-unit-of-life",
    color: "#38bdf8",
    icon: "🔬",
    subunits: [
      {
        subunit: "Introduction",
        frames: [{ title: "The Cell — Unit of Life", narration: "The cell is the basic structural and functional unit of all living organisms. The cell theory, proposed by Schleiden and Schwann in 1838-39 and later modified by Virchow, states that all living organisms are made of cells, the cell is the basic unit of life, and all cells arise from pre-existing cells. Rudolf Virchow added that cells arise from pre-existing cells — Omnis cellula e cellula.", keyPoints: ["Schleiden (1838): All plants made of cells", "Schwann (1839): All animals made of cells", "Virchow (1855): Cells arise from pre-existing cells", "Cell Theory: smallest unit of life capable of independent existence"], visual: "cell" }],
      },
      {
        subunit: "Prokaryotic Cells",
        frames: [{ title: "Prokaryotic Cell Structure", narration: "Prokaryotic cells lack a membrane-bound nucleus and other membrane-bound organelles. They are the simplest and most ancient cells, including bacteria and cyanobacteria. The prokaryotic cell has a cell wall, plasma membrane, cytoplasm with ribosomes, a nucleoid region containing a single circular DNA, and sometimes plasmids. They may have pili for attachment and flagella for movement. Prokaryotic ribosomes are 70S (50S + 30S subunits).", keyPoints: ["No membrane-bound nucleus — DNA in nucleoid region", "No membrane-bound organelles (except plasma membrane)", "Ribosomes: 70S = 50S + 30S", "Cell wall: peptidoglycan in bacteria", "May have flagella, pili, capsule, plasmids"], visual: "cell" }],
      },
      {
        subunit: "Eukaryotic Cells",
        frames: [{ title: "Eukaryotic Cell — Organelles", narration: "Eukaryotic cells have a true membrane-bound nucleus and many specialised organelles. The nucleus contains chromatin, nucleolus, and is surrounded by a double nuclear membrane with nuclear pores. The endomembrane system includes ER, Golgi apparatus, lysosomes, and vacuoles. Mitochondria and chloroplasts have their own DNA and ribosomes, suggesting endosymbiotic origin. Cytoskeleton maintains cell shape.", keyPoints: ["Nucleus: double membrane, nuclear pores, nucleolus", "ER: Rough (ribosomes, protein synthesis) / Smooth (lipid synthesis)", "Golgi: processing, sorting, secretion of proteins", "Mitochondria: 70S ribosomes, own DNA (endosymbiotic origin)", "Centrosome/Centrioles: only in animal cells, involved in cell division"], visual: "cell" }],
      },
      ...["What is a Cell?", "Cell Theory", "Overview of Cell"].map(s => genericSubunit(s, "Cell – The Unit of Life")),
    ],
  },
  {
    chapterId: "biomolecules",
    color: "#c084fc",
    icon: "⚗️",
    subunits: [
      {
        subunit: "Proteins",
        frames: [{ title: "Proteins — Structure and Function", narration: "Proteins are polymers of amino acids linked by peptide bonds. There are 20 types of amino acids. Protein structure exists at four levels: primary (sequence of amino acids), secondary (alpha helix or beta pleated sheet), tertiary (3D folded structure), and quaternary (multiple polypeptide chains). Proteins function as enzymes, structural proteins, transport proteins (haemoglobin), antibodies, and hormones.", keyPoints: ["20 amino acids + peptide bonds → proteins", "Primary: amino acid sequence", "Secondary: α-helix or β-pleated sheet (H-bonds)", "Tertiary: 3D folding (disulfide bonds, hydrophobic interactions)", "Quaternary: multiple chains (e.g., Hb = 4 chains)"], visual: "molecules" }],
      },
      {
        subunit: "Enzymes",
        frames: [{ title: "Enzymes — Biological Catalysts", narration: "Enzymes are biological catalysts that speed up biochemical reactions without being consumed. They are mostly proteins, but some RNA molecules called ribozymes also act as enzymes. Enzymes lower the activation energy of reactions. The active site of an enzyme binds specifically to its substrate — 'Lock and Key' model proposed by Emil Fischer, and 'Induced Fit' model by Koshland. Factors affecting enzyme activity include temperature, pH, substrate concentration, and inhibitors.", keyPoints: ["Enzymes = protein catalysts (mostly); Ribozymes = RNA catalysts", "Lock and Key model (Fischer) vs Induced Fit (Koshland)", "Optimum temperature for most human enzymes: 37°C", "Km (Michaelis constant) = substrate conc. at half maximum velocity", "Competitive inhibitors: block active site; Non-competitive: bind allosteric site"], visual: "molecules" }],
      },
      ...["Introduction", "Chemical Composition Analysis", "Primary and Secondary Metabolites", "Biomacromolecules", "Polysaccharides", "Nucleic Acids", "Concept of Metabolism"].map(s => genericSubunit(s, "Biomolecules")),
    ],
  },
  {
    chapterId: "cell-cycle-and-division",
    color: "#fb923c",
    icon: "🔄",
    subunits: [
      {
        subunit: "Cell Cycle",
        frames: [{ title: "The Cell Cycle", narration: "The cell cycle is the sequence of events from one cell division to the next. It has two main phases: Interphase (G1, S, G2) and M Phase (mitotic phase). Interphase is the longest phase where the cell grows and replicates DNA. G1 is the first growth phase, S phase is when DNA synthesis occurs, and G2 is the second growth phase. The M phase includes karyokinesis (nuclear division) and cytokinesis (cytoplasmic division). Some cells exit the cycle and enter a quiescent G0 stage.", keyPoints: ["Interphase = G1 + S + G2 (longest phase)", "G1: cell growth, protein synthesis", "S Phase: DNA replication (amount doubles)", "G2: preparation for division", "M Phase: Karyokinesis + Cytokinesis", "G0 = quiescent phase (cells exit cycle temporarily)"], visual: "cycle" }],
      },
      {
        subunit: "Mitosis (M Phase)",
        frames: [{ title: "Mitosis — Equational Division", narration: "Mitosis is the type of cell division that produces two genetically identical daughter cells from one parent cell. It occurs in somatic cells. The stages are Prophase (chromatin condenses into chromosomes, spindle forms), Metaphase (chromosomes align at equatorial plate), Anaphase (sister chromatids separate to poles), and Telophase (nuclear envelope reforms). Metaphase is the best stage to study chromosome morphology.", keyPoints: ["Prophase: chromatin condenses, spindle forms, nuclear envelope breaks", "Metaphase: chromosomes at equatorial plate (best for karyotype study)", "Anaphase: centromeres split, chromatids move to poles", "Telophase: nuclear envelope reforms, chromosomes decondense", "Result: 2 genetically identical diploid cells"], visual: "cycle" }],
      },
      {
        subunit: "Meiosis",
        frames: [{ title: "Meiosis — Reductional Division", narration: "Meiosis is the type of cell division that produces four haploid daughter cells from one diploid parent cell. It occurs in reproductive cells during gamete formation. Meiosis has two successive divisions: Meiosis I (reductional — homologous chromosomes separate) and Meiosis II (equational — sister chromatids separate). Crossing over occurs during Prophase I, specifically at the pachytene stage, and is the source of genetic recombination.", keyPoints: ["Result: 4 haploid (n) cells from 1 diploid (2n) cell", "Meiosis I = Reductional division (homologs separate)", "Meiosis II = Equational division (chromatids separate)", "Crossing over at Pachytene (Prophase I) → genetic recombination", "Prophase I stages: LEPTOZITAIDI — Leptotene, Zygotene, Pachytene, Diplotene, Diakinesis"], visual: "cycle" }],
      },
      ...["Introduction", "Significance of Mitosis", "Significance of Meiosis"].map(s => genericSubunit(s, "Cell Cycle and Cell Division")),
    ],
  },
  {
    chapterId: "photosynthesis",
    color: "#22c55e",
    icon: "☀️",
    subunits: [
      {
        subunit: "Light Reactions",
        frames: [{ title: "Light Reactions — The Photo Step", narration: "Light reactions occur in the thylakoid membranes of chloroplasts. When light is absorbed by chlorophyll, it excites electrons to a higher energy state. These electrons flow through the Electron Transport Chain (ETC), generating ATP via photophosphorylation and NADPH. Water molecules are split (photolysis) to replace lost electrons, releasing O₂ as a by-product. Cyclic photophosphorylation involves only PS I and produces only ATP. Non-cyclic involves both PS I and PS II, producing ATP, NADPH, and O₂.", keyPoints: ["Light reactions: Thylakoid membranes", "PS II: absorbs 680 nm light, splits water (photolysis), releases O₂", "PS I: absorbs 700 nm light, reduces NADP⁺ to NADPH", "Cyclic: Only PS I → only ATP (no NADPH, no O₂)", "Non-cyclic: PS II + PS I → ATP + NADPH + O₂"], visual: "flow" }],
      },
      {
        subunit: "Calvin Cycle (C3 Pathway)",
        frames: [{ title: "Calvin Cycle — The Dark Reactions", narration: "The Calvin cycle, also called the C3 pathway or dark reactions, occurs in the stroma of chloroplasts. It uses ATP and NADPH from light reactions to fix CO₂ into carbohydrates. The cycle has three stages: Carbon fixation (CO₂ + RuBP → 2 molecules of 3-PGA, catalysed by RuBisCO), Reduction (3-PGA → G3P using ATP and NADPH), and Regeneration of RuBP (ATP required). For every 3 CO₂ fixed, 1 G3P is produced, and 6 turns of the cycle produce 1 glucose.", keyPoints: ["Occurs in stroma", "CO₂ fixation: CO₂ + RuBP → 2 × 3-PGA (enzyme: RuBisCO)", "First stable product: 3-PGA (3-carbon compound)", "3 turns fix 3 CO₂ → produces 1 G3P (used for glucose)", "6 turns → 1 glucose (C6H₁₂O₆) using 18 ATP + 12 NADPH"], visual: "cycle" }],
      },
      ...["Introduction", "Early Experiments", "Where does Photosynthesis Occur?", "Pigments Involved", "Electron Transport", "C4 Pathway", "Photorespiration", "Factors Affecting Photosynthesis"].map(s => genericSubunit(s, "Photosynthesis in Higher Plants")),
    ],
  },
  {
    chapterId: "respiration-in-plants",
    color: "#fb7185",
    icon: "🌬️",
    subunits: [
      {
        subunit: "Glycolysis",
        frames: [{ title: "Glycolysis — The Universal Pathway", narration: "Glycolysis, also called the EMP pathway after Embden, Meyerhof, and Parnas, occurs in the cytoplasm of all living cells. It is the first step of both aerobic and anaerobic respiration. One molecule of glucose (6C) is broken down into two molecules of pyruvate (3C). The net gain is 2 ATP and 2 NADH per glucose molecule. The process consists of 10 enzymatic steps and does not require oxygen — it is an anaerobic process.", keyPoints: ["Glycolysis = EMP pathway, occurs in cytoplasm", "Glucose (6C) → 2 Pyruvate (3C)", "Gross ATP used: 2; Gross ATP produced: 4 → Net gain: 2 ATP", "Also produces 2 NADH per glucose", "Occurs in ALL organisms, both aerobic and anaerobic", "Does NOT require oxygen"], visual: "flow" }],
      },
      {
        subunit: "Krebs Cycle",
        frames: [{ title: "Krebs Cycle — TCA Cycle", narration: "The Krebs cycle, also called the Citric Acid Cycle or TCA cycle, occurs in the matrix of mitochondria. Pyruvate from glycolysis is first converted to Acetyl-CoA (2C) in the mitochondrial matrix. Acetyl-CoA enters the cycle by combining with Oxaloacetate (4C) to form Citrate (6C). Each turn of the cycle releases 2 CO₂, produces 3 NADH, 1 FADH₂, and 1 GTP (equivalent to ATP). Two turns occur per glucose molecule.", keyPoints: ["Occurs in mitochondrial matrix", "Pyruvate → Acetyl-CoA + CO₂ + NADH (by pyruvate decarboxylation)", "Acetyl-CoA (2C) + OAA (4C) → Citrate (6C)", "Per turn: 2CO₂, 3NADH, 1FADH₂, 1GTP released", "2 turns per glucose → 6CO₂, 6NADH, 2FADH₂, 2GTP total"], visual: "cycle" }],
      },
      ...["Introduction", "Do Plants Breathe?", "Fermentation", "Aerobic Respiration", "Respiratory Balance Sheet", "Amphibolic Pathway", "Respiratory Quotient"].map(s => genericSubunit(s, "Respiration in Plants")),
    ],
  },
  {
    chapterId: "plant-growth-and-development",
    color: "#86efac",
    icon: "🌻",
    subunits: [
      {
        subunit: "Plant Growth Regulators",
        frames: [{ title: "Five Classes of Plant Hormones", narration: "Plant Growth Regulators (PGRs) are chemical substances that regulate growth, development, and responses in plants. The five main classes are: Auxins (promote cell elongation, discovered by Charles Darwin), Gibberellins (promote stem elongation, seed germination), Cytokinins (promote cell division, delay senescence), Abscisic Acid (promotes dormancy, stomatal closure — stress hormone), and Ethylene (promotes fruit ripening, senescence — only gaseous PGR).", keyPoints: ["Auxins: discovered by Darwin; promote cell elongation (IAA)", "Gibberellins: promote stem elongation, seed germination, bolting", "Cytokinins: promote cell division (discovered as kinetin)", "ABA = stress hormone: promotes dormancy, closes stomata", "Ethylene = only gaseous PGR; promotes fruit ripening"], visual: "generic" }],
      },
      ...["Introduction", "Growth", "Differentiation, Dedifferentiation and Redifferentiation", "Development", "Auxins, Gibberellins, Cytokinins, ABA, Ethylene", "Photoperiodism", "Vernalisation"].map(s => genericSubunit(s, "Plant Growth and Development")),
    ],
  },
  {
    chapterId: "body-fluids-and-circulation",
    color: "#f87171",
    icon: "❤️",
    subunits: [
      {
        subunit: "Cardiac Cycle",
        frames: [{ title: "The Cardiac Cycle", narration: "The cardiac cycle refers to the sequence of events during one complete heartbeat. It lasts about 0.8 seconds at 75 beats per minute. The cycle has three phases: Atrial systole (0.1 sec — atria contract, blood enters ventricles), Ventricular systole (0.3 sec — ventricles contract, blood is pumped out), and Joint diastole (0.4 sec — all chambers relax and fill with blood). Cardiac output = heart rate × stroke volume = 75 × 70 mL = 5250 mL/min.", keyPoints: ["Complete cycle = 0.8 seconds at 75 bpm", "Atrial systole = 0.1 sec", "Ventricular systole = 0.3 sec", "Joint diastole = 0.4 sec", "Cardiac Output = Heart Rate × Stroke Volume = ~5 L/min", "Stroke volume ≈ 70 mL per beat"], visual: "heart" }],
      },
      {
        subunit: "Blood",
        frames: [{ title: "Blood — Composition and Function", narration: "Blood is a fluid connective tissue consisting of plasma and formed elements. Plasma makes up about 55% of blood and contains water, proteins (albumin, globulin, fibrinogen), glucose, hormones, and waste products. The formed elements (45%) include RBCs (erythrocytes), WBCs (leukocytes), and platelets (thrombocytes). RBCs are the most numerous (5 million/mm³), lack nucleus and mitochondria in mature form, and contain haemoglobin for oxygen transport.", keyPoints: ["Blood = plasma (55%) + formed elements (45%)", "RBC: 5 million/mm³, no nucleus, haemoglobin, lifespan 120 days", "WBC: 6000-8000/mm³, nucleus present, immune defence", "Platelets: 2.5 lakh/mm³, involved in clotting", "Blood groups: ABO system (Landsteiner) and Rh factor"], visual: "flow" }],
      },
      ...["Introduction", "Lymph", "Circulatory Pathways", "Human Circulatory System", "Electrocardiograph (ECG)", "Double Circulation", "Regulation of Cardiac Activity", "Disorders of Circulatory System"].map(s => genericSubunit(s, "Body Fluids and Circulation")),
    ],
  },
  {
    chapterId: "excretory-products",
    color: "#fbbf24",
    icon: "🫘",
    subunits: [
      {
        subunit: "Urine Formation",
        frames: [{ title: "Three Steps of Urine Formation", narration: "Urine is formed in the nephrons through three main processes. Glomerular filtration occurs in the Bowman's capsule, where blood is filtered under high pressure, producing about 180 litres of filtrate per day. Tubular reabsorption then reclaims useful substances like glucose, amino acids, water, and ions from the filtrate back into the blood. Tubular secretion adds waste substances like creatinine, some drugs, and H⁺ ions from blood into the tubule. The final urine output is about 1.5 litres per day.", keyPoints: ["Step 1: Glomerular Filtration → 180 L filtrate/day (ultrafiltration)", "Step 2: Tubular Reabsorption → reclaims glucose, amino acids, 99% water", "Step 3: Tubular Secretion → adds creatinine, H⁺, K⁺ to tubule", "Final urine = 1-1.5 L/day", "GFR = 125 mL/min (filtered blood rate)"], visual: "flow" }],
      },
      ...["Introduction", "Human Excretory System", "Function of Tubules", "Concentration of Filtrate", "Regulation of Kidney Function", "Micturition", "Role of Other Organs in Excretion", "Disorders of Excretory System"].map(s => genericSubunit(s, "Excretory Products and their Elimination")),
    ],
  },
  ...["locomotion-and-movement", "neural-control-and-coordination", "chemical-coordination"].map((id, i) => ({
    chapterId: id,
    color: ["#818cf8", "#a78bfa", "#c084fc"][i],
    icon: ["💪", "🧠", "⚡"][i],
    subunits: [] as SubunitAnim[],
  })),
  {
    chapterId: "sexual-reproduction-flowering-plants",
    color: "#f472b6",
    icon: "🌸",
    subunits: [
      {
        subunit: "Pre-fertilisation: Structures and Events",
        frames: [{ title: "Stamen, Pistil and Pollen", narration: "The stamen consists of a filament and an anther. Each anther has 4 microsporangia, each of which produces pollen grains. Pollen mother cells undergo meiosis to form 4 haploid microspores — this is microsporogenesis. Each microspore develops into a mature pollen grain with an exine (sporopollenin) and intine layer. The pistil has a stigma, style, and ovary. Inside the ovary, ovules develop, and within each ovule, a megaspore mother cell undergoes meiosis to form 4 megaspores.", keyPoints: ["Stamen = filament + anther (4 microsporangia)", "Microsporogenesis: Pollen mother cells → 4 haploid pollen grains (meiosis)", "Pollen wall: outer exine (sporopollenin) + inner intine (cellulose)", "Pistil = stigma + style + ovary", "Megasporogenesis: MMC → 4 megaspores (meiosis); 1 functional megaspore develops"], visual: "generic" }],
      },
      ...["Introduction", "Flower – Structure and Function", "Double Fertilisation", "Post-fertilisation: Structures and Events", "Apomixis and Polyembryony"].map(s => genericSubunit(s, "Sexual Reproduction in Flowering Plants")),
    ],
  },
  {
    chapterId: "human-reproduction",
    color: "#fb923c",
    icon: "🧬",
    subunits: [
      {
        subunit: "Gametogenesis",
        frames: [{ title: "Spermatogenesis and Oogenesis", narration: "Gametogenesis is the process of forming gametes. Spermatogenesis occurs in the seminiferous tubules of the testes. Spermatogonia undergo mitosis to multiply, then enter meiosis to form spermatocytes, spermatids, and finally mature spermatozoa through spermiogenesis. Oogenesis occurs in the ovaries. Oogonia multiply before birth, then arrest in Prophase I. At puberty, one primary oocyte completes Meiosis I to form a secondary oocyte, which completes Meiosis II only upon fertilisation.", keyPoints: ["Spermatogenesis: Spermatogonia → Primary spermatocyte → 4 spermatids", "Spermiogenesis: Spermatid → Sperm (morphological change)", "Oogenesis: Most oocytes arrested in Prophase I of Meiosis I", "Secondary oocyte released at ovulation (arrested in Metaphase II)", "Meiosis II of oocyte completes only after fertilisation by sperm"], visual: "cell" }],
      },
      ...["Introduction", "Male Reproductive System", "Female Reproductive System", "Menstrual Cycle", "Fertilisation and Implantation", "Pregnancy and Embryonic Development", "Parturition and Lactation"].map(s => genericSubunit(s, "Human Reproduction")),
    ],
  },
  {
    chapterId: "principles-of-inheritance",
    color: "#a78bfa",
    icon: "🧬",
    subunits: [
      {
        subunit: "Mendel's Experiments",
        frames: [{ title: "Gregor Mendel — Laws of Inheritance", narration: "Gregor Johann Mendel conducted experiments on the garden pea, Pisum sativum, between 1856 and 1863 in Austria. He studied 7 pairs of contrasting traits. He proposed two laws: Law of Segregation — during gamete formation, the two alleles of a gene segregate from each other so each gamete carries only one allele; and Law of Independent Assortment — genes for different traits assort independently of each other during gamete formation (applies to genes on different chromosomes).", keyPoints: ["Mendel worked with Pisum sativum (garden pea), 7 traits", "Law of Segregation = Law of Purity of Gametes", "Monohybrid ratio: 3:1 (phenotypic), 1:2:1 (genotypic)", "Law of Independent Assortment (different chromosomes)", "Dihybrid ratio: 9:3:3:1", "F1 always shows dominant phenotype"], visual: "compare" }],
      },
      ...["Introduction", "Inheritance of One Gene", "Inheritance of Two Genes", "Sex Determination", "Mutation", "Genetic Disorders"].map(s => genericSubunit(s, "Principles of Inheritance and Variation")),
    ],
  },
  {
    chapterId: "molecular-basis-of-inheritance",
    color: "#60a5fa",
    icon: "🧬",
    subunits: [
      {
        subunit: "The DNA",
        frames: [{ title: "DNA Structure — Watson and Crick", narration: "DNA, deoxyribonucleic acid, is the genetic material in most organisms. Watson and Crick (1953) proposed the double helix model based on X-ray diffraction data from Rosalind Franklin. DNA consists of two polynucleotide chains coiled in a right-handed double helix. The two strands are antiparallel — one runs 5' to 3' and the other 3' to 5'. Bases pair specifically: Adenine with Thymine (2 H-bonds) and Guanine with Cytosine (3 H-bonds) — Chargaff's rules.", keyPoints: ["Watson & Crick (1953) proposed double helix model", "Antiparallel strands: one 5'→3', other 3'→5'", "A=T (2 H-bonds); G≡C (3 H-bonds) — Chargaff's rules", "Width: 2 nm; one turn = 10 bp = 3.4 nm pitch", "Human DNA total: ~6.6 × 10⁹ bp; ~2.2 m long in each cell"], visual: "dna" }],
      },
      {
        subunit: "Replication",
        frames: [{ title: "DNA Replication", narration: "DNA replication is semiconservative — each new double helix contains one original strand and one newly synthesized strand. This was proven by Meselson and Stahl (1958) using heavy nitrogen labelling. Replication begins at the origin of replication where helicase unwinds the double helix. DNA polymerase adds new nucleotides in the 5' to 3' direction only. The leading strand is synthesised continuously, while the lagging strand is synthesised in fragments called Okazaki fragments.", keyPoints: ["Semiconservative replication — proved by Meselson & Stahl (1958)", "Helicase: unwinds DNA; SSBPs: keep strands apart", "DNA Polymerase: adds nucleotides 5'→3' direction only", "Leading strand: continuous synthesis", "Lagging strand: discontinuous (Okazaki fragments) + DNA ligase joins them"], visual: "dna" }],
      },
      {
        subunit: "Transcription",
        frames: [{ title: "Transcription — DNA to RNA", narration: "Transcription is the process of synthesizing RNA from DNA. Only one strand of DNA (template strand) is used as template. RNA polymerase binds to the promoter region and synthesises RNA in the 5' to 3' direction, adding ribonucleotides complementary to the template strand. The RNA produced is complementary and antiparallel to the template strand. In prokaryotes, transcription and translation are coupled. In eukaryotes, mRNA is processed (5' cap, poly-A tail, splicing of introns) before leaving the nucleus.", keyPoints: ["Template strand = antisense strand = non-coding strand", "RNA polymerase adds NTPs in 5'→3' direction", "In eukaryotes: hnRNA → processed to mRNA (5' cap + poly-A tail + splicing)", "Introns removed; Exons retained in mature mRNA", "Transcription unit: Promoter + Structural gene + Terminator"], visual: "dna" }],
      },
      ...["Introduction", "Search for Genetic Material", "RNA World", "Genetic Code", "Translation", "Regulation of Gene Expression", "Human Genome Project", "DNA Fingerprinting"].map(s => genericSubunit(s, "Molecular Basis of Inheritance")),
    ],
  },
  ...["evolution", "human-health-and-disease", "microbes-in-human-welfare", "biotechnology-principles", "biotechnology-applications", "organisms-and-populations", "ecosystem", "biodiversity-and-conservation", "reproductive-health"].map((id, i) => ({
    chapterId: id,
    color: ["#34d399", "#f87171", "#4ade80", "#818cf8", "#c084fc", "#86efac", "#22c55e", "#6ee7b7", "#fb7185"][i],
    icon: ["🌍", "🦠", "🧫", "⚗️", "🌾", "🌿", "🌳", "🦋", "💊"][i],
    subunits: [] as SubunitAnim[],
  })),
];

export function getChapterAnim(chapterId: string): ChapterAnim | undefined {
  return animationData.find(c => c.chapterId === chapterId);
}

export function getSubunitAnim(chapterId: string, subunit: string, chapterName?: string): SubunitAnim {
  const chapter = getChapterAnim(chapterId);
  if (!chapter) return genericSubunit(subunit, chapterName || chapterId);

  // 1. Exact match
  const exact = chapter.subunits.find(s => s.subunit === subunit);
  if (exact) return exact;

  // 2. Case-insensitive match
  const lower = subunit.toLowerCase();
  const caseInsensitive = chapter.subunits.find(s => s.subunit.toLowerCase() === lower);
  if (caseInsensitive) return caseInsensitive;

  // 3. Fuzzy: check if either contains the other (handles "Introduction" matching "Introduction to Breathing and Respiration")
  const fuzzy = chapter.subunits.find(s => {
    const a = s.subunit.toLowerCase();
    const b = lower;
    return a.includes(b) || b.includes(a);
  });
  if (fuzzy) return fuzzy;

  // 4. Keyword overlap: share at least 2 significant words
  const words = lower.split(/\s+/).filter(w => w.length > 3);
  const keyword = chapter.subunits.find(s => {
    const sWords = s.subunit.toLowerCase().split(/\s+/);
    return words.filter(w => sWords.includes(w)).length >= 2;
  });
  if (keyword) return keyword;

  return genericSubunit(subunit, chapterName || chapterId);
}
