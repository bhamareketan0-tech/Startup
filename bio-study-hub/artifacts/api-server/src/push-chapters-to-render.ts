const RENDER_API = "https://startup-jz85.onrender.com/api";

const CLASS_11 = [
  { id: "the-living-world", name: "The Living World", subunits: ["Introduction", "What is Living?", "Biodiversity", "Taxonomic Categories", "Taxonomical Aids"] },
  { id: "biological-classification", name: "Biological Classification", subunits: ["Introduction", "Two Kingdom Classification", "Five Kingdom Classification", "Kingdom Monera", "Kingdom Protista", "Kingdom Fungi", "Viruses and Viroids"] },
  { id: "plant-kingdom", name: "Plant Kingdom", subunits: ["Introduction", "Algae", "Bryophytes", "Pteridophytes", "Gymnosperms", "Angiosperms", "Plant Life Cycles and Alternation of Generations"] },
  { id: "animal-kingdom", name: "Animal Kingdom", subunits: ["Introduction", "Basis of Classification", "Porifera", "Coelenterata", "Platyhelminthes", "Aschelminthes", "Annelida", "Arthropoda", "Mollusca", "Echinodermata", "Hemichordata", "Chordata"] },
  { id: "morphology-of-flowering-plants", name: "Morphology of Flowering Plants", subunits: ["Introduction", "The Root", "The Stem", "The Leaf", "The Inflorescence", "The Flower", "The Fruit", "The Seed", "Description of Some Important Families"] },
  { id: "anatomy-of-flowering-plants", name: "Anatomy of Flowering Plants", subunits: ["Introduction", "Tissues", "Tissue Systems", "Anatomy of Dicotyledonous Plants", "Anatomy of Monocotyledonous Plants", "Secondary Growth"] },
  { id: "structural-organisation-in-animals", name: "Structural Organisation in Animals", subunits: ["Introduction", "Animal Tissues", "Earthworm", "Cockroach", "Frog"] },
  { id: "cell-the-unit-of-life", name: "Cell: The Unit of Life", subunits: ["Introduction", "Cell Theory and Overview", "Prokaryotic Cells", "Eukaryotic Cells", "Cell Membrane", "Cell Wall", "Nucleus", "Mitochondria", "Plastids", "Ribosomes", "Vacuoles", "Cilia and Flagella", "Centrosome and Microbodies"] },
  { id: "biomolecules", name: "Biomolecules", subunits: ["Introduction", "Amino Acids", "Proteins and Structure", "Carbohydrates and Polysaccharides", "Nucleic Acids", "Enzymes", "Metabolic Basis of Living"] },
  { id: "cell-cycle-and-cell-division", name: "Cell Cycle and Cell Division", subunits: ["Introduction", "Cell Cycle", "Mitosis", "Meiosis", "Significance of Cell Division"] },
  { id: "transport-in-plants", name: "Transport in Plants", subunits: ["Introduction", "Means of Transport", "Plant-Water Relations", "Long Distance Transport of Water", "Transpiration", "Uptake and Transport of Mineral Nutrients"] },
  { id: "mineral-nutrition", name: "Mineral Nutrition", subunits: ["Introduction", "Methods to Study Mineral Requirements", "Essential Mineral Elements", "Deficiency Symptoms", "Mechanism of Absorption", "Metabolism of Nitrogen"] },
  { id: "photosynthesis-in-higher-plants", name: "Photosynthesis in Higher Plants", subunits: ["Introduction", "Early Experiments", "Pigments Involved in Photosynthesis", "Light Reactions", "Electron Transport Chain", "C3 Cycle (Calvin Cycle)", "C4 Cycle", "Photorespiration", "Factors Affecting Photosynthesis"] },
  { id: "respiration-in-plants", name: "Respiration in Plants", subunits: ["Introduction", "Glycolysis", "Fermentation", "Aerobic Respiration (Krebs Cycle)", "Oxidative Phosphorylation", "Respiratory Quotient"] },
  { id: "plant-growth-and-development", name: "Plant Growth and Development", subunits: ["Introduction", "Plant Growth", "Differentiation and Development", "Plant Growth Regulators", "Seed Dormancy", "Vernalisation", "Photoperiodism"] },
];

const CLASS_12 = [
  { id: "reproduction-in-organisms", name: "Reproduction in Organisms", subunits: ["Introduction", "Asexual Reproduction", "Sexual Reproduction"] },
  { id: "sexual-reproduction-in-flowering-plants", name: "Sexual Reproduction in Flowering Plants", subunits: ["Introduction", "Flower a Fascinating Organ", "Pre-fertilisation Structures and Events", "Double Fertilisation", "Post-fertilisation Events", "Apomixis and Polyembryony"] },
  { id: "human-reproduction", name: "Human Reproduction", subunits: ["Introduction", "Male Reproductive System", "Female Reproductive System", "Gametogenesis", "Menstrual Cycle", "Fertilisation and Implantation", "Pregnancy and Embryonic Development", "Parturition and Lactation"] },
  { id: "reproductive-health", name: "Reproductive Health", subunits: ["Introduction", "Reproductive Health Problems", "Population Explosion and Birth Control", "Contraception Methods", "Sexually Transmitted Diseases", "Infertility"] },
  { id: "principles-of-inheritance-and-variation", name: "Principles of Inheritance and Variation", subunits: ["Introduction", "Mendel's Laws", "Inheritance of One Gene", "Inheritance of Two Genes", "Sex Determination", "Mutation", "Genetic Disorders"] },
  { id: "molecular-basis-of-inheritance", name: "Molecular Basis of Inheritance", subunits: ["Introduction", "DNA Structure", "RNA", "DNA Replication", "Transcription", "Genetic Code", "Translation", "Regulation of Gene Expression", "Human Genome Project", "DNA Fingerprinting"] },
  { id: "evolution", name: "Evolution", subunits: ["Introduction", "Origin of Life", "Evolution of Life Forms", "What is Evolution?", "Mechanism of Evolution", "Hardy-Weinberg Principle", "Brief Account of Evolution", "Adaptive Radiation", "Evolution of Man"] },
  { id: "human-health-and-disease", name: "Human Health and Disease", subunits: ["Introduction", "Common Diseases in Humans", "Immunity", "AIDS", "Cancer", "Drugs and Alcohol Abuse"] },
  { id: "strategies-for-enhancement-in-food-production", name: "Strategies for Enhancement in Food Production", subunits: ["Introduction", "Animal Husbandry", "Plant Breeding", "Single Cell Protein", "Tissue Culture"] },
  { id: "microbes-in-human-welfare", name: "Microbes in Human Welfare", subunits: ["Introduction", "Microbes in Household Products", "Microbes in Industrial Products", "Microbes in Sewage Treatment", "Microbes in Biogas Production", "Microbes as Biocontrol Agents", "Microbes as Biofertilisers"] },
  { id: "biotechnology-principles-and-processes", name: "Biotechnology Principles and Processes", subunits: ["Introduction", "Principles of Biotechnology", "Tools of Recombinant DNA Technology", "Processes of Recombinant DNA Technology"] },
  { id: "biotechnology-and-its-applications", name: "Biotechnology and its Applications", subunits: ["Introduction", "Biotechnology in Agriculture", "Biotechnology in Medicine", "Ethical Issues"] },
  { id: "organisms-and-populations", name: "Organisms and Populations", subunits: ["Introduction", "Organisms and its Environment", "Populations", "Population Interactions"] },
  { id: "ecosystem", name: "Ecosystem", subunits: ["Introduction", "Ecosystem Structure and Function", "Productivity", "Decomposition", "Energy Flow", "Ecological Pyramids", "Ecological Succession", "Nutrient Cycling"] },
  { id: "biodiversity-and-conservation", name: "Biodiversity and Conservation", subunits: ["Introduction", "Biodiversity", "Loss of Biodiversity", "Conservation of Biodiversity"] },
  { id: "environmental-issues", name: "Environmental Issues", subunits: ["Introduction", "Air Pollution", "Water Pollution", "Solid Wastes", "Agrochemicals and Radioactive Wastes", "Deforestation", "International Agreements"] },
];

async function push(cls: string, chapters: typeof CLASS_11) {
  const withClass = chapters.map((c, i) => ({ ...c, class: cls, subject: "Biology", order: i }));
  const res = await fetch(`${RENDER_API}/chapters/bulk`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ class: cls, chapters: withClass }),
  });
  const json = await res.json() as { data: unknown[]; error?: string };
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  console.log(`✅ Class ${cls}: pushed ${(json.data ?? []).length} chapters`);
}

(async () => {
  await push("11", CLASS_11);
  await push("12", CLASS_12);
  console.log("Done.");
})().catch((e) => { console.error(e); process.exit(1); });
