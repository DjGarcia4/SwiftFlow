// What's new, newest first, for the landing's "Novedades". Add an entry
// at the top when something ships; the page shows the latest few. `date`
// is the month it shipped, as "YYYY-MM".

export const CHANGELOG = [
  {
    date: "2026-09",
    title: "Curso desde cero",
    text: "24 lecciones para aprender a escribir sin mirar: una fila por vez, hasta los números y los signos, con estrellas y en tu teclado.",
  },
  {
    date: "2026-09",
    title: "Dictado",
    text: "Una voz en español te dicta frases y las escribís sin verlas, con tildes y todo. El texto aparece al final, con lo que se te escapó marcado.",
  },
  {
    date: "2026-09",
    title: "Clásicos, y más español",
    text: "Un modo con Cervantes, Bécquer, Machado, Martí y más, verso por verso. El modo Palabras ahora arma oraciones, con ¿? y ¡!. Y logros y retos nuevos para la lectura, el modo foco y los modos exigentes.",
  },
  {
    date: "2026-09",
    title: "Modo foco",
    text: "Solo la palabra que estás escribiendo y la siguiente, grandes y en el centro.",
  },
  {
    date: "2026-09",
    title: "Modos exigentes",
    text: "Muerte súbita, corregir para avanzar y precisión mínima, combinables con cualquier modo. Y tres logros nuevos para quien se anime.",
  },
  {
    date: "2026-09",
    title: "Para todos",
    text: "Tema de alto contraste, diálogos que se manejan con el teclado, y resultados, logros y consejos anunciados al lector de pantalla.",
  },
  {
    date: "2026-09",
    title: "Texto a tu gusto",
    text: "Elegí la fuente, el tamaño y el interlineado del texto, y si el cursor se desliza o salta.",
  },
  {
    date: "2026-09",
    title: "Tu distribución de teclado",
    text: "Latinoamericano, España, EE. UU. internacional, Dvorak o Colemak: el teclado en pantalla, los dedos y los consejos siguen al tuyo.",
  },
  {
    date: "2026-09",
    title: "La página de SwiftFlow",
    text: "Todo lo que hace, en un solo lugar, y una frase para probarlo ahí mismo.",
  },
  {
    date: "2026-09",
    title: "Recompensas por nivel",
    text: "Colores para toda la app, estilos de cursor y sonidos de teclado que se desbloquean subiendo de nivel.",
  },
  {
    date: "2026-09",
    title: "Recordatorio de racha",
    text: "Un aviso cuando hoy todavía no practicaste, y si querés, uno a la noche.",
  },
  {
    date: "2026-09",
    title: "Colores por dedo",
    text: "El teclado en pantalla te muestra qué dedo va en cada tecla.",
  },
  {
    date: "2026-09",
    title: "Palabras que te cuestan",
    text: "Las palabras enteras que se te traban, y un entrenamiento con ellas.",
  },
  {
    date: "2026-09",
    title: "Mi texto",
    text: "Pegá lo que escribís seguido y practicalo tal cual.",
  },
  {
    date: "2026-09",
    title: "Sin red",
    text: "Escribí sin ver tus errores hasta el final.",
  },
  {
    date: "2026-09",
    title: "Marcapasos y fantasma",
    text: "Corré contra el ritmo de tu récord o contra una velocidad fija.",
  },
];

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// "septiembre de 2026"
export const formatChangelogDate = (date) => {
  const [year, month] = date.split("-").map(Number);
  return `${MONTHS[month - 1]} de ${year}`;
};
