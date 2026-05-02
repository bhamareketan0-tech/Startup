import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, CheckSquare, Square, ChevronDown, ChevronRight, BookOpen } from "lucide-react";

interface SubjectChapter { id: string; name: string; subunits: string[] }
type ClassKey = "11" | "12";

const SYLLABUS: Record<ClassKey, SubjectChapter[]> = {
  "11": [
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
  ],
  "12": [
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
  ],
};

const TOTAL_11 = SYLLABUS["11"].reduce((s, c) => s + c.subunits.length, 0);
const TOTAL_12 = SYLLABUS["12"].reduce((s, c) => s + c.subunits.length, 0);
const TOTAL_ALL = TOTAL_11 + TOTAL_12;

export function SyllabusPage() {
  const navigate = useNavigate();
  const [activeClass, setActiveClass] = useState<ClassKey>("11");
  const [studiedKeys, setStudiedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get("/syllabus-progress").then((r: unknown) => {
      const data = ((r as { data: Array<{ class: string; chapter: string; subunit: string; studied: boolean }> }).data) || [];
      const keys = new Set(data.filter((d) => d.studied).map((d) => `${d.class}::${d.chapter}::${d.subunit}`));
      setStudiedKeys(keys);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggle = useCallback(async (cls: string, chapter: string, subunit: string) => {
    const key = `${cls}::${chapter}::${subunit}`;
    setStudiedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    await api.post("/syllabus-progress/toggle", { class: cls, chapter, subunit }).catch(() => {});
  }, []);

  const toggleChapter = (cls: string, chapter: SubjectChapter) => {
    const allStudied = chapter.subunits.every((s) => studiedKeys.has(`${cls}::${chapter.id}::${s}`));
    const updates = chapter.subunits.map((s) => {
      const key = `${cls}::${chapter.id}::${s}`;
      return { key, subunit: s, shouldStudy: !allStudied };
    });
    setStudiedKeys((prev) => {
      const next = new Set(prev);
      for (const u of updates) { if (u.shouldStudy) next.add(u.key); else next.delete(u.key); }
      return next;
    });
    Promise.all(updates.map(({ subunit, shouldStudy }) => {
      const key = `${cls}::${chapter.id}::${subunit}`;
      const currentStudied = studiedKeys.has(key);
      if (currentStudied !== shouldStudy) return api.post("/syllabus-progress/toggle", { class: cls, chapter: chapter.id, subunit }).catch(() => {});
      return Promise.resolve();
    }));
  };

  const studiedInClass = (cls: ClassKey) => SYLLABUS[cls].reduce((s, c) => s + c.subunits.filter((su) => studiedKeys.has(`${cls}::${c.id}::${su}`)).length, 0);
  const totalInClass = (cls: ClassKey) => cls === "11" ? TOTAL_11 : TOTAL_12;
  const overallStudied = studiedInClass("11") + studiedInClass("12");
  const overallPct = Math.round((overallStudied / TOTAL_ALL) * 100);
  const classPct = (cls: ClassKey) => Math.round((studiedInClass(cls) / totalInClass(cls)) * 100);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent", color: "var(--bs-text)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="relative z-10 max-w-4xl mx-auto">

        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 mb-8 font-mono uppercase text-sm" style={{ color: "var(--bs-text-muted)" }}>
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center transform -skew-x-12" style={{ background: "#00FF9D" }}>
              <BookOpen className="w-6 h-6 text-black transform skew-x-12" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Syllabus Tracker</h1>
              <p className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>NEET Biology — Complete Syllabus</p>
            </div>
          </div>
          <div className="border p-4 text-right" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <div className="text-3xl font-black" style={{ color: "#00FF9D" }}>{overallPct}%</div>
            <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>{overallStudied}/{TOTAL_ALL} complete</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {(["11", "12"] as ClassKey[]).map((cls) => {
            const pct = classPct(cls);
            const studied = studiedInClass(cls);
            const total = totalInClass(cls);
            return (
              <div key={cls} className="border p-4" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black uppercase text-sm">Class {cls}</span>
                  <span className="font-black text-xl" style={{ color: pct === 100 ? "#00FF9D" : "var(--bs-text)" }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "#00FF9D" }} />
                </div>
                <div className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{studied}/{total} subunits</div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mb-6">
          {(["11", "12"] as ClassKey[]).map((cls) => (
            <button key={cls} onClick={() => setActiveClass(cls)} className="px-6 py-2 font-black uppercase text-sm transition-all" style={{ background: activeClass === cls ? "#00FF9D" : "var(--bs-surface)", color: activeClass === cls ? "black" : "var(--bs-text-muted)", border: activeClass === cls ? "none" : `1px solid var(--bs-border-subtle)` }}>
              Class {cls}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse" style={{ background: "var(--bs-surface)" }} />)}</div>
        ) : (
          <div className="space-y-3">
            {SYLLABUS[activeClass].map((chapter) => {
              const doneCount = chapter.subunits.filter((s) => studiedKeys.has(`${activeClass}::${chapter.id}::${s}`)).length;
              const allDone = doneCount === chapter.subunits.length;
              const pct = chapter.subunits.length > 0 ? Math.round((doneCount / chapter.subunits.length) * 100) : 0;
              const isExpanded = expandedChapters.has(chapter.id);

              return (
                <div key={chapter.id} className="border overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: isExpanded ? "#00FF9D44" : "var(--bs-border-subtle)" }}>
                  <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={() => setExpandedChapters((prev) => { const n = new Set(prev); if (n.has(chapter.id)) n.delete(chapter.id); else n.add(chapter.id); return n; })}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleChapter(activeClass, chapter); }}
                      className="shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
                      style={{ color: allDone ? "#00FF9D" : "var(--bs-text-muted)" }}
                      title={allDone ? "Mark all as not studied" : "Mark all as studied"}
                    >
                      {allDone ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black uppercase text-sm tracking-tight">{chapter.name}</span>
                        <span className="font-mono text-xs shrink-0 ml-2" style={{ color: allDone ? "#00FF9D" : "var(--bs-text-muted)" }}>{doneCount}/{chapter.subunits.length}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: pct === 100 ? "#00FF9D" : pct > 50 ? "#00FF9D99" : "#00FF9D44" }} />
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--bs-text-muted)" }} /> : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--bs-text-muted)" }} />}
                  </div>
                  {isExpanded && (
                    <div className="border-t px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3" style={{ borderColor: "var(--bs-border-subtle)" }}>
                      {chapter.subunits.map((subunit) => {
                        const key = `${activeClass}::${chapter.id}::${subunit}`;
                        const studied = studiedKeys.has(key);
                        return (
                          <button
                            key={subunit}
                            onClick={() => toggle(activeClass, chapter.id, subunit)}
                            className="flex items-center gap-3 p-2 text-left min-h-[44px] transition-all rounded"
                            style={{ background: studied ? "rgba(0,255,157,0.08)" : "transparent" }}
                          >
                            <span className="shrink-0" style={{ color: studied ? "#00FF9D" : "var(--bs-text-muted)" }}>
                              {studied ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </span>
                            <span className="text-sm font-mono" style={{ color: studied ? "var(--bs-text)" : "var(--bs-text-muted)", textDecoration: studied ? "line-through" : "none", opacity: studied ? 0.7 : 1 }}>
                              {subunit}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
