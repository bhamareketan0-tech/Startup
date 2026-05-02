import mongoose from "mongoose";
import { Chapter } from "./models/chapter";

const MONGODB_URI = process.env.MONGODB_URI || "";
if (!MONGODB_URI) { console.error("No MONGODB_URI"); process.exit(1); }

const CLASS_11: { id: string; name: string; subunits: string[] }[] = [
  { id: "the-living-world", name: "The Living World", subunits: ["What is Living?", "Biodiversity", "Taxonomic Categories", "Taxonomical Aids"] },
  { id: "biological-classification", name: "Biological Classification", subunits: ["Two Kingdom Classification", "Five Kingdom Classification", "Kingdom Monera", "Kingdom Protista", "Kingdom Fungi", "Viruses and Viroids"] },
  { id: "plant-kingdom", name: "Plant Kingdom", subunits: ["Algae", "Bryophytes", "Pteridophytes", "Gymnosperms", "Angiosperms", "Plant Life Cycles and Alternation of Generations"] },
  { id: "animal-kingdom", name: "Animal Kingdom", subunits: ["Basis of Classification", "Porifera", "Coelenterata", "Platyhelminthes", "Aschelminthes", "Annelida", "Arthropoda", "Mollusca", "Echinodermata", "Hemichordata", "Chordata"] },
  { id: "morphology-of-flowering-plants", name: "Morphology of Flowering Plants", subunits: ["The Root", "The Stem", "The Leaf", "The Inflorescence", "The Flower", "The Fruit", "The Seed", "Description of Some Important Families"] },
  { id: "anatomy-of-flowering-plants", name: "Anatomy of Flowering Plants", subunits: ["Tissues", "Tissue Systems", "Anatomy of Dicotyledonous Plants", "Anatomy of Monocotyledonous Plants", "Secondary Growth"] },
  { id: "structural-organisation-in-animals", name: "Structural Organisation in Animals", subunits: ["Animal Tissues", "Earthworm", "Cockroach", "Frog"] },
  { id: "cell-the-unit-of-life", name: "Cell: The Unit of Life", subunits: ["Cell Theory and Overview", "Prokaryotic Cells", "Eukaryotic Cells", "Cell Membrane", "Cell Wall", "Nucleus", "Mitochondria", "Plastids", "Ribosomes", "Vacuoles", "Cilia and Flagella", "Centrosome and Microbodies"] },
  { id: "biomolecules", name: "Biomolecules", subunits: ["Amino Acids", "Proteins and Structure", "Carbohydrates and Polysaccharides", "Nucleic Acids", "Enzymes", "Metabolic Basis of Living"] },
  { id: "cell-cycle-and-cell-division", name: "Cell Cycle and Cell Division", subunits: ["Cell Cycle", "Mitosis", "Meiosis", "Significance of Cell Division"] },
  { id: "transport-in-plants", name: "Transport in Plants", subunits: ["Means of Transport", "Plant–Water Relations", "Long Distance Transport of Water", "Transpiration", "Uptake and Transport of Mineral Nutrients"] },
  { id: "mineral-nutrition", name: "Mineral Nutrition", subunits: ["Methods to Study Mineral Requirements", "Essential Mineral Elements", "Deficiency Symptoms", "Mechanism of Absorption", "Metabolism of Nitrogen"] },
  { id: "photosynthesis-in-higher-plants", name: "Photosynthesis in Higher Plants", subunits: ["Early Experiments", "Pigments Involved in Photosynthesis", "Light Reactions", "Electron Transport Chain", "C3 Cycle (Calvin Cycle)", "C4 Cycle", "Photorespiration", "Factors Affecting Photosynthesis"] },
  { id: "respiration-in-plants", name: "Respiration in Plants", subunits: ["Glycolysis", "Fermentation", "Aerobic Respiration (Krebs Cycle)", "Oxidative Phosphorylation", "Respiratory Quotient"] },
  { id: "plant-growth-and-development", name: "Plant Growth and Development", subunits: ["Plant Growth", "Differentiation and Development", "Plant Growth Regulators", "Seed Dormancy", "Vernalisation", "Photoperiodism"] },
];

const CLASS_12: { id: string; name: string; subunits: string[] }[] = [
  { id: "reproduction-in-organisms", name: "Reproduction in Organisms", subunits: ["Asexual Reproduction", "Sexual Reproduction"] },
  { id: "sexual-reproduction-in-flowering-plants", name: "Sexual Reproduction in Flowering Plants", subunits: ["Flower – a Fascinating Organ", "Pre-fertilisation Structures and Events", "Double Fertilisation", "Post-fertilisation Events", "Apomixis and Polyembryony"] },
  { id: "human-reproduction", name: "Human Reproduction", subunits: ["Male Reproductive System", "Female Reproductive System", "Gametogenesis", "Menstrual Cycle", "Fertilisation and Implantation", "Pregnancy and Embryonic Development", "Parturition and Lactation"] },
  { id: "reproductive-health", name: "Reproductive Health", subunits: ["Reproductive Health Problems", "Population Explosion and Birth Control", "Contraception Methods", "Sexually Transmitted Diseases", "Infertility"] },
  { id: "principles-of-inheritance-and-variation", name: "Principles of Inheritance and Variation", subunits: ["Mendel's Laws", "Inheritance of One Gene", "Inheritance of Two Genes", "Sex Determination", "Mutation", "Genetic Disorders"] },
  { id: "molecular-basis-of-inheritance", name: "Molecular Basis of Inheritance", subunits: ["DNA Structure", "RNA", "DNA Replication", "Transcription", "Genetic Code", "Translation", "Regulation of Gene Expression", "Human Genome Project", "DNA Fingerprinting"] },
  { id: "evolution", name: "Evolution", subunits: ["Origin of Life", "Evolution of Life Forms", "What is Evolution?", "Mechanism of Evolution", "Hardy-Weinberg Principle", "Brief Account of Evolution", "Adaptive Radiation", "Evolution of Man"] },
  { id: "human-health-and-disease", name: "Human Health and Disease", subunits: ["Common Diseases in Humans", "Immunity", "AIDS", "Cancer", "Drugs and Alcohol Abuse"] },
  { id: "strategies-for-enhancement-in-food-production", name: "Strategies for Enhancement in Food Production", subunits: ["Animal Husbandry", "Plant Breeding", "Single Cell Protein", "Tissue Culture"] },
  { id: "microbes-in-human-welfare", name: "Microbes in Human Welfare", subunits: ["Microbes in Household Products", "Microbes in Industrial Products", "Microbes in Sewage Treatment", "Microbes in Biogas Production", "Microbes as Biocontrol Agents", "Microbes as Biofertilisers"] },
  { id: "biotechnology-principles-and-processes", name: "Biotechnology – Principles and Processes", subunits: ["Principles of Biotechnology", "Tools of Recombinant DNA Technology", "Processes of Recombinant DNA Technology"] },
  { id: "biotechnology-and-its-applications", name: "Biotechnology and its Applications", subunits: ["Biotechnology in Agriculture", "Biotechnology in Medicine", "Ethical Issues"] },
  { id: "organisms-and-populations", name: "Organisms and Populations", subunits: ["Organisms and its Environment", "Populations", "Population Interactions"] },
  { id: "ecosystem", name: "Ecosystem", subunits: ["Ecosystem Structure and Function", "Productivity", "Decomposition", "Energy Flow", "Ecological Pyramids", "Ecological Succession", "Nutrient Cycling"] },
  { id: "biodiversity-and-conservation", name: "Biodiversity and Conservation", subunits: ["Biodiversity", "Loss of Biodiversity", "Conservation of Biodiversity"] },
  { id: "environmental-issues", name: "Environmental Issues", subunits: ["Air Pollution", "Water Pollution", "Solid Wastes", "Agrochemicals and Radioactive Wastes", "Deforestation", "International Agreements"] },
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected to MongoDB");

  for (const cls of ["11", "12"] as const) {
    const list = cls === "11" ? CLASS_11 : CLASS_12;
    await Chapter.deleteMany({ class: cls });
    await Chapter.insertMany(list.map((c, i) => ({ ...c, class: cls, subject: "Biology", order: i })));
    console.log(`✅ Seeded ${list.length} chapters for Class ${cls}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((e) => { console.error(e); process.exit(1); });
