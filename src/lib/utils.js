// src/lib/utils.js

// Mapeamento de siglas de estados (mantém as siglas como estão)
const estadoSiglas = {
  AC: "ac",
  AL: "al",
  AP: "ap",
  AM: "am",
  BA: "ba",
  CE: "ce",
  DF: "df",
  ES: "es",
  GO: "go",
  MA: "ma",
  MT: "mt",
  MS: "ms",
  MG: "mg",
  PA: "pa",
  PB: "pb",
  PR: "pr",
  PE: "pe",
  PI: "pi",
  RJ: "rj",
  RN: "rn",
  RS: "rs",
  RO: "ro",
  RR: "rr",
  SC: "sc",
  SP: "sp",
  SE: "se",
  TO: "to",
};

export function generateSlug(nome, estado) {
  // Remove acentos e caracteres especiais
  const normalizedNome = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  // Converte estado para minúsculo
  const siglaEstado =
    estadoSiglas[estado.toUpperCase()] || estado.toLowerCase();

  // Cria slug no formato nomedacidadeuf (sem traços)
  const slug = `${normalizedNome}${siglaEstado}`;

  return slug;
}
