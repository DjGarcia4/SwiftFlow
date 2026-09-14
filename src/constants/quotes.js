// Manually curated bank of quotes for "quote" mode: short, well-known
// sayings (with their author) instead of a generic paragraph — each
// session picks one at random and you type it start to finish.
export const quotes = [
  { text: "La vida es lo que pasa mientras estás ocupado haciendo otros planes.", author: "John Lennon" },
  { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
  { text: "La imaginación es más importante que el conocimiento.", author: "Albert Einstein" },
  { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
  { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier" },
  { text: "Sé el cambio que quieres ver en el mundo.", author: "Mahatma Gandhi" },
  { text: "La única forma de hacer algo imposible es creer que es posible.", author: "Lewis Carroll" },
  { text: "El futuro pertenece a quienes creen en la belleza de sus sueños.", author: "Eleanor Roosevelt" },
  { text: "No hay atajos para llegar a un lugar que valga la pena.", author: "Beverly Sills" },
  { text: "La perseverancia es la madre de la buena fortuna.", author: "Miguel de Cervantes" },
  { text: "Solo sé que no sé nada.", author: "Sócrates" },
  { text: "Pienso, luego existo.", author: "René Descartes" },
  { text: "En la vida no hay nada que temer, solo hay que entender.", author: "Marie Curie" },
  { text: "El conocimiento habla, pero la sabiduría escucha.", author: "Jimi Hendrix" },
  { text: "Un viaje de mil millas comienza con un solo paso.", author: "Lao Tse" },
  { text: "La belleza está en los ojos de quien mira.", author: "Oscar Wilde" },
  { text: "Solo se ve bien con el corazón; lo esencial es invisible a los ojos.", author: "Antoine de Saint-Exupéry" },
  { text: "El que no vive para servir, no sirve para vivir.", author: "Madre Teresa de Calcuta" },
  { text: "La libertad es lo que haces con lo que te han hecho.", author: "Jean-Paul Sartre" },
  { text: "Somos lo que hacemos repetidamente. La excelencia, entonces, no es un acto sino un hábito.", author: "Aristóteles" },
  { text: "El talento gana partidos, pero el trabajo en equipo y la inteligencia ganan campeonatos.", author: "Michael Jordan" },
  { text: "No es la especie más fuerte la que sobrevive, sino la que mejor se adapta al cambio.", author: "Charles Darwin" },
  { text: "La ignorancia es la noche de la mente, pero una noche sin luna ni estrellas.", author: "Confucio" },
  { text: "Lo que no te mata te hace más fuerte.", author: "Friedrich Nietzsche" },
  { text: "La educación es el arma más poderosa que puedes usar para cambiar el mundo.", author: "Nelson Mandela" },
];

// Picks a random quote, avoiding immediately repeating the last one.
export const getRandomQuote = (lastText) => {
  if (quotes.length === 1) return quotes[0];

  let quote;
  do {
    quote = quotes[Math.floor(Math.random() * quotes.length)];
  } while (quote.text === lastText);

  return quote;
};
