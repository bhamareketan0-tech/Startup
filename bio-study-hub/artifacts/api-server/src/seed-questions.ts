import mongoose from "mongoose";
import { Question } from "./models/question";

const MONGODB_URI = process.env.MONGODB_URI || "";
if (!MONGODB_URI) { console.error("No MONGODB_URI"); process.exit(1); }

const questions = [
  { question: "Which organelle is known as the powerhouse of the cell?", option1: "Nucleus", option2: "Mitochondria", option3: "Ribosome", option4: "Golgi Body", correct: "option2", explanation: "Mitochondria produce ATP through cellular respiration, providing energy to the cell.", subject: "Biology", chapter: "cell-the-unit-of-life", subunit: "Mitochondria", class: "11", difficulty: "easy", type: "mcq", is_active: true },
  { question: "DNA replication is called semi-conservative because:", option1: "Only one strand of DNA is copied", option2: "Each new DNA has one old and one new strand", option3: "Both strands are newly synthesized", option4: "DNA is copied twice", correct: "option2", explanation: "In semi-conservative replication, each daughter DNA molecule retains one parental strand and one newly synthesized strand.", subject: "Biology", chapter: "molecular-basis-of-inheritance", subunit: "DNA Replication", class: "12", difficulty: "medium", type: "mcq", is_active: true },
  { question: "Which of the following is NOT a function of the nucleus?", option1: "Controls cell activities", option2: "Contains genetic information", option3: "Synthesizes proteins", option4: "Site of DNA replication", correct: "option3", explanation: "Protein synthesis occurs at ribosomes in the cytoplasm, not in the nucleus.", subject: "Biology", chapter: "cell-the-unit-of-life", subunit: "Nucleus", class: "11", difficulty: "medium", type: "mcq", is_active: true },
  { question: "The process by which plants make food using sunlight is called:", option1: "Respiration", option2: "Transpiration", option3: "Photosynthesis", option4: "Fermentation", correct: "option3", explanation: "Photosynthesis converts light energy into chemical energy stored as glucose.", subject: "Biology", chapter: "photosynthesis-in-higher-plants", subunit: "Introduction", class: "11", difficulty: "easy", type: "mcq", is_active: true },
  { question: "Assertion (A): Mendel chose garden pea for his experiments. Reason (R): Garden pea has many contrasting traits and a short life cycle.", option1: "Both A and R are true and R is the correct explanation of A", option2: "Both A and R are true but R is not the correct explanation of A", option3: "A is true but R is false", option4: "A is false but R is true", correct: "option1", explanation: "Mendel chose pea because of distinct contrasting characters, easy cultivation, and short generation time.", subject: "Biology", chapter: "principles-of-inheritance-and-variation", subunit: "Mendel's Laws", class: "12", difficulty: "medium", type: "assertion", is_active: true },
  { question: "Which of the following is the correct sequence of events in mitosis?", option1: "Prophase → Metaphase → Anaphase → Telophase", option2: "Metaphase → Prophase → Anaphase → Telophase", option3: "Anaphase → Prophase → Metaphase → Telophase", option4: "Telophase → Anaphase → Metaphase → Prophase", correct: "option1", explanation: "Mitosis follows the sequence: Prophase, Metaphase, Anaphase, Telophase (PMAT).", subject: "Biology", chapter: "cell-cycle-and-cell-division", subunit: "Mitosis", class: "11", difficulty: "easy", type: "mcq", is_active: true },
  { question: "The genetic material in most organisms is:", option1: "RNA", option2: "DNA", option3: "Protein", option4: "Lipid", correct: "option2", explanation: "DNA (deoxyribonucleic acid) is the genetic material in most organisms, encoding all hereditary information.", subject: "Biology", chapter: "molecular-basis-of-inheritance", subunit: "DNA Structure", class: "12", difficulty: "easy", type: "mcq", is_active: true },
  { question: "Transpiration in plants occurs mainly through:", option1: "Roots", option2: "Stem", option3: "Stomata", option4: "Flowers", correct: "option3", explanation: "About 90% of water loss in plants occurs through stomata present mainly on leaves.", subject: "Biology", chapter: "transport-in-plants", subunit: "Transpiration", class: "11", difficulty: "easy", type: "mcq", is_active: true },
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected to MongoDB");
  const count = await Question.countDocuments();
  if (count > 0) {
    console.log(`Already ${count} questions exist — skipping seed to avoid duplicates.`);
  } else {
    await Question.insertMany(questions);
    console.log(`✅ Inserted ${questions.length} test questions`);
  }
  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((e) => { console.error(e); process.exit(1); });
