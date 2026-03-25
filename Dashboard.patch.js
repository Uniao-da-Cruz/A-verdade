/*
  ──────────────────────────────────────────────────────────────────
  PATCH — Dashboard.js
  Apply the two blocks below in sequence, leaving everything else
  untouched. Both changes follow the same pattern already used by
  the CadÚnico and Nuclear-Risks ExternalWatchSection components.
  ──────────────────────────────────────────────────────────────────

  ① Add this import at the very top of the file alongside the
    other lucide-react icons (e.g. after "Landmark"):

      import { Landmark, Map } from "lucide-react";

  ──────────────────────────────────────────────────────────────────

  ② Place the new <ExternalWatchSection> block IMMEDIATELY AFTER
    the closing tag of the nuclear-risks section (</ExternalWatchSection>)
    and BEFORE the Quick Navigation grid that starts with:
    <motion.div ... className="grid grid-cols-2 md:grid-cols-4 gap-3">

    ↓↓↓ INSERT HERE ↓↓↓
*/

// ── Mapa das Periferias Watch Section ──────────────────────────────
<ExternalWatchSection
  icon={Map}
  title="Mapa das Periferias"
  description="Plataforma interativa do Ministério das Cidades com dados georreferenciados sobre territórios periféricos, infraestrutura e desigualdade urbana."
  iconClassName="text-republic-blue"
  wrapperClassName="mb-6 bg-zinc-900/50 border border-republic-blue/20 p-6"
  sectionTestId="mapa-periferias-watch-section"
  gridClassName="grid grid-cols-1 md:grid-cols-2 gap-3"
  actions={[
    {
      testId: "mapa-periferias-internal-page-link",
      icon: Map,
      label: "Explorar mapa no Vigília",
      description: "Visualizar mapa interativo embutido",
      className: "border-republic-blue/20 bg-republic-blue/5 hover:bg-republic-blue/10",
      iconClassName: "text-republic-blue",
      labelClassName: "text-republic-blue",
      onClick: () => navigate("/mapa-periferias"),
    },
    {
      testId: "mapa-periferias-external-link",
      icon: ExternalLink,
      label: "Abrir mapa oficial",
      description: "interativo-mapadasperiferias.cidades.gov.br",
      className: "border-white/10 hover:border-republic-blue/20 hover:bg-republic-blue/5",
      iconClassName: "text-zinc-400",
      labelClassName: "text-zinc-300",
      href: "https://interativo-mapadasperiferias.cidades.gov.br/mapa",
    },
  ]}
  footer="Dados oficiais — Programa Nós Periféricos · Ministério das Cidades."
/>
// ────────────────────────────────────────────────────────────────────


/*
  ③ In the Quick Navigation grid (4 buttons at the bottom), add a
    5th button — or replace the last one — to include the new page.
    Suggested addition (expand the grid to grid-cols-2 md:grid-cols-5):

    { label: "Mapa das Periferias", path: "/mapa-periferias", color: "border-republic-blue/20 hover:bg-republic-blue/5 hover:border-republic-blue/40" },

  Full updated array:
*/

{[
  { label: "Espectro Político",    path: "/spectrum",          color: "border-republic-blue/20 hover:bg-republic-blue/5 hover:border-republic-blue/40" },
  { label: "Recursos Educacionais",path: "/resources",         color: "border-neon-green/20 hover:bg-neon-green/5 hover:border-neon-green/40" },
  { label: "Programas Sociais",    path: "/programas-sociais", color: "border-alert-yellow/20 hover:bg-alert-yellow/5 hover:border-alert-yellow/40" },
  { label: "Riscos Nucleares",     path: "/riscos-nucleares",  color: "border-corruption-red/20 hover:bg-corruption-red/5 hover:border-corruption-red/40" },
  { label: "Mapa das Periferias",  path: "/mapa-periferias",   color: "border-republic-blue/20 hover:bg-republic-blue/5 hover:border-republic-blue/40" },
]}
// Update the grid className from grid-cols-4 to:
// "grid grid-cols-2 md:grid-cols-5 gap-3"
