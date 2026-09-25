// Manually curated bank of quotes for "quote" mode: short, well-known
// sayings (with their author) instead of a generic paragraph — each
// session picks one at random and you type it start to finish.
import { englishQuotes } from "./en/quotes";
import { inPracticeLanguage } from "./practiceLanguage";

export const quotes = [
  {
    text: "La vida es lo que pasa mientras estás ocupado haciendo otros planes.",
    author: "John Lennon",
  },
  {
    text: "El único modo de hacer un gran trabajo es amar lo que haces.",
    author: "Steve Jobs",
  },
  {
    text: "La imaginación es más importante que el conocimiento.",
    author: "Albert Einstein",
  },
  { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
  {
    text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    author: "Robert Collier",
  },
  { text: "Sé el cambio que quieres ver en el mundo.", author: "Mahatma Gandhi" },
  {
    text: "La única forma de hacer algo imposible es creer que es posible.",
    author: "Lewis Carroll",
  },
  {
    text: "El futuro pertenece a quienes creen en la belleza de sus sueños.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "No hay atajos para llegar a un lugar que valga la pena.",
    author: "Beverly Sills",
  },
  {
    text: "La perseverancia es la madre de la buena fortuna.",
    author: "Miguel de Cervantes",
  },
  { text: "Solo sé que no sé nada.", author: "Sócrates" },
  { text: "Pienso, luego existo.", author: "René Descartes" },
  {
    text: "En la vida no hay nada que temer, solo hay que entender.",
    author: "Marie Curie",
  },
  { text: "El conocimiento habla, pero la sabiduría escucha.", author: "Jimi Hendrix" },
  { text: "Un viaje de mil millas comienza con un solo paso.", author: "Lao Tse" },
  { text: "La belleza está en los ojos de quien mira.", author: "Oscar Wilde" },
  {
    text: "Solo se ve bien con el corazón; lo esencial es invisible a los ojos.",
    author: "Antoine de Saint-Exupéry",
  },
  {
    text: "El que no vive para servir, no sirve para vivir.",
    author: "Madre Teresa de Calcuta",
  },
  {
    text: "La libertad es lo que haces con lo que te han hecho.",
    author: "Jean-Paul Sartre",
  },
  {
    text: "Somos lo que hacemos repetidamente. La excelencia, entonces, no es un acto sino un hábito.",
    author: "Aristóteles",
  },
  {
    text: "El talento gana partidos, pero el trabajo en equipo y la inteligencia ganan campeonatos.",
    author: "Michael Jordan",
  },
  {
    text: "No es la especie más fuerte la que sobrevive, sino la que mejor se adapta al cambio.",
    author: "Charles Darwin",
  },
  {
    text: "La ignorancia es la noche de la mente, pero una noche sin luna ni estrellas.",
    author: "Confucio",
  },
  { text: "Lo que no te mata te hace más fuerte.", author: "Friedrich Nietzsche" },
  {
    text: "La educación es el arma más poderosa que puedes usar para cambiar el mundo.",
    author: "Nelson Mandela",
  },
  {
    text: "El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el valor para continuar.",
    author: "Winston Churchill",
  },
  {
    text: "La gente olvidará lo que dijiste, pero nunca olvidará cómo la hiciste sentir.",
    author: "Maya Angelou",
  },
  {
    text: "Dime y lo olvido, enséñame y lo recuerdo, involúcrame y lo aprendo.",
    author: "Benjamin Franklin",
  },
  {
    text: "El optimismo es la fe que conduce al logro; nada se puede hacer sin esperanza.",
    author: "Helen Keller",
  },
  {
    text: "Todo niño es un artista. El problema es cómo seguir siendo artista una vez que crecemos.",
    author: "Pablo Picasso",
  },
  { text: "La simplicidad es la máxima sofisticación.", author: "Leonardo da Vinci" },
  {
    text: "Si he visto más lejos es porque estoy sentado sobre hombros de gigantes.",
    author: "Isaac Newton",
  },
  {
    text: "A pesar de todo, sigo creyendo que la gente es realmente buena de corazón.",
    author: "Anne Frank",
  },
  { text: "El secreto para salir adelante es comenzar.", author: "Mark Twain" },
  { text: "La mente lo es todo. En lo que piensas, te conviertes.", author: "Buda" },
  {
    text: "La inteligencia es la capacidad de adaptarse al cambio.",
    author: "Stephen Hawking",
  },
  {
    text: "Para ser irremplazable, uno siempre debe ser diferente.",
    author: "Coco Chanel",
  },
  {
    text: "No temo al hombre que practicó diez mil patadas una vez, sino al que practicó una patada diez mil veces.",
    author: "Bruce Lee",
  },
  {
    text: "Un niño, un maestro, un libro y un lápiz pueden cambiar el mundo.",
    author: "Malala Yousafzai",
  },
  { text: "Si puedes soñarlo, puedes hacerlo.", author: "Walt Disney" },
  {
    text: "La vida es realmente simple, pero insistimos en hacerla complicada.",
    author: "Confucio",
  },
  { text: "Hazlo o no lo hagas, pero no lo intentes.", author: "Yoda" },
  {
    text: "El hombre que mueve una montaña comienza cargando pequeñas piedras.",
    author: "Confucio",
  },
  {
    text: "Todos somos muy ignorantes. Lo que ocurre es que no todos ignoramos las mismas cosas.",
    author: "Albert Einstein",
  },
  {
    text: "La mejor manera de predecir el futuro es crearlo.",
    author: "Peter Drucker",
  },
  {
    text: "Lo que sabemos es una gota de agua; lo que ignoramos es el océano.",
    author: "Isaac Newton",
  },
  {
    text: "La vida es diez por ciento lo que me pasa y noventa por ciento cómo reacciono a ello.",
    author: "Charles Swindoll",
  },
  {
    text: "No hay camino hacia la felicidad: la felicidad es el camino.",
    author: "Buda",
  },
  {
    text: "Cada logro comienza con la decisión de intentarlo.",
    author: "Gail Devers",
  },
  {
    text: "La disciplina es el puente entre las metas y los logros.",
    author: "Jim Rohn",
  },
  {
    text: "El único límite para nuestra realización de mañana serán nuestras dudas de hoy.",
    author: "Franklin D. Roosevelt",
  },
  {
    text: "La calidad no es un acto, es un hábito.",
    author: "Aristóteles",
  },
  {
    text: "Si te caes siete veces, levántate ocho.",
    author: "Proverbio japonés",
  },
  {
    text: "El fracaso es simplemente la oportunidad de comenzar de nuevo, esta vez de forma más inteligente.",
    author: "Henry Ford",
  },
  {
    text: "No hay nada permanente excepto el cambio.",
    author: "Heráclito",
  },
  {
    text: "El que teme sufrir, ya sufre lo que teme.",
    author: "Michel de Montaigne",
  },
  {
    text: "La duda es la madre de la invención.",
    author: "Galileo Galilei",
  },
  {
    text: "Un objetivo sin un plan es solo un deseo.",
    author: "Antoine de Saint-Exupéry",
  },
  {
    text: "El que no arriesga, no gana.",
    author: "Proverbio popular",
  },
  {
    text: "La vida se encoge o se expande en proporción al coraje de cada uno.",
    author: "Anaïs Nin",
  },
  {
    text: "Nunca es tarde para ser quien podrías haber sido.",
    author: "George Eliot",
  },
  {
    text: "El conocimiento es poder.",
    author: "Francis Bacon",
  },
  {
    text: "La paciencia es amarga, pero su fruto es dulce.",
    author: "Aristóteles",
  },
  {
    text: "Haz lo que puedas, con lo que tengas, donde estés.",
    author: "Theodore Roosevelt",
  },
  {
    text: "La mente que se abre a una nueva idea jamás vuelve a su tamaño original.",
    author: "Albert Einstein",
  },
  {
    text: "El único modo de tener un amigo es siéndolo.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "No es la carga la que te agota, es la forma en que la llevas.",
    author: "Lena Horne",
  },
  {
    text: "La adversidad revela el genio, la prosperidad lo oculta.",
    author: "Horacio",
  },
  {
    text: "Las grandes cosas nunca vienen de la zona de confort.",
    author: "Anónimo",
  },
  {
    text: "El éxito consiste en ir de fracaso en fracaso sin perder el entusiasmo.",
    author: "Winston Churchill",
  },
  {
    text: "Quien tiene un porqué para vivir puede soportar casi cualquier cómo.",
    author: "Friedrich Nietzsche",
  },
  {
    text: "El talento se gana en privado, se muestra en público.",
    author: "Anónimo",
  },
  {
    text: "No busques la felicidad, créala.",
    author: "Anónimo",
  },
  {
    text: "La perfección no es alcanzable, pero si perseguimos la perfección podemos alcanzar la excelencia.",
    author: "Vince Lombardi",
  },
  {
    text: "Nada en la vida debe ser temido, solamente comprendido.",
    author: "Marie Curie",
  },
  {
    text: "El verdadero viaje de descubrimiento no consiste en buscar nuevos paisajes, sino en tener nuevos ojos.",
    author: "Marcel Proust",
  },
  {
    text: "La vida es corta, y el arte, largo.",
    author: "Hipócrates",
  },
  {
    text: "El primer paso no te lleva a donde quieres ir, pero te saca de donde estás.",
    author: "Anónimo",
  },
  {
    text: "Siempre imaginé que el Paraíso sería algún tipo de biblioteca.",
    author: "Jorge Luis Borges",
  },
  {
    text: "Uno no es lo que es por lo que escribe, sino por lo que ha leído.",
    author: "Jorge Luis Borges",
  },
  {
    text: "Caminante, no hay camino, se hace camino al andar.",
    author: "Antonio Machado",
  },
  {
    text: "La poesía no quiere adeptos, quiere amantes.",
    author: "Federico García Lorca",
  },
  {
    text: "Podrán cortar todas las flores, pero no podrán detener la primavera.",
    author: "Pablo Neruda",
  },
  {
    text: "La vida no es la que uno vivió, sino la que uno recuerda y cómo la recuerda para contarla.",
    author: "Gabriel García Márquez",
  },
  {
    text: "Nada está perdido si se tiene el valor de proclamar que todo está perdido y hay que empezar de nuevo.",
    author: "Julio Cortázar",
  },
  {
    text: "Hacer es la mejor manera de decir.",
    author: "José Martí",
  },
  {
    text: "El arte de vencer se aprende en las derrotas.",
    author: "Simón Bolívar",
  },
  {
    text: "Procuremos más ser padres de nuestro porvenir que hijos de nuestro pasado.",
    author: "Miguel de Unamuno",
  },
  {
    text: "Yo soy yo y mi circunstancia, y si no la salvo a ella no me salvo yo.",
    author: "José Ortega y Gasset",
  },
  {
    text: "Todo hombre puede ser, si se lo propone, escultor de su propio cerebro.",
    author: "Santiago Ramón y Cajal",
  },
  {
    text: "Pies, para qué los quiero si tengo alas para volar.",
    author: "Frida Kahlo",
  },
  {
    text: "Donde haya un árbol que plantar, plántalo tú.",
    author: "Gabriela Mistral",
  },
  {
    text: "La libertad es uno de los más preciosos dones que a los hombres dieron los cielos.",
    author: "Miguel de Cervantes",
  },
  {
    text: "No hay viento favorable para el que no sabe adónde va.",
    author: "Séneca",
  },
  {
    text: "La felicidad de tu vida depende de la calidad de tus pensamientos.",
    author: "Marco Aurelio",
  },
  {
    text: "No son las cosas las que nos perturban, sino la opinión que tenemos de ellas.",
    author: "Epicteto",
  },
  {
    text: "La gota horada la piedra no por su fuerza, sino por su constancia.",
    author: "Ovidio",
  },
  {
    text: "En medio del caos, también hay oportunidad.",
    author: "Sun Tzu",
  },
  {
    text: "Lo mejor es enemigo de lo bueno.",
    author: "Voltaire",
  },
  {
    text: "Lo que no empiezas hoy, nunca lo terminarás mañana.",
    author: "Johann Wolfgang von Goethe",
  },
  {
    text: "Nada hay más poderoso que una idea a la que le ha llegado su tiempo.",
    author: "Victor Hugo",
  },
  {
    text: "Todos quieren cambiar el mundo, pero nadie piensa en cambiarse a sí mismo.",
    author: "León Tolstói",
  },
  {
    text: "Un libro debe ser el hacha que rompa el mar helado dentro de nosotros.",
    author: "Franz Kafka",
  },
  {
    text: "En medio del invierno aprendí por fin que había en mí un verano invencible.",
    author: "Albert Camus",
  },
  {
    text: "No se nace mujer, se llega a serlo.",
    author: "Simone de Beauvoir",
  },
  {
    text: "Una mujer necesita dinero y una habitación propia para poder escribir.",
    author: "Virginia Woolf",
  },
  {
    text: "El corazón tiene razones que la razón no entiende.",
    author: "Blaise Pascal",
  },
  {
    text: "Lo que no puedo crear, no lo entiendo.",
    author: "Richard Feynman",
  },
  {
    text: "En algún lugar, algo increíble espera ser descubierto.",
    author: "Carl Sagan",
  },
  {
    text: "La optimización prematura es la raíz de todos los males.",
    author: "Donald Knuth",
  },
  {
    text: "Depurar es el doble de difícil que escribir el código.",
    author: "Brian Kernighan",
  },
  {
    text: "Cualquiera puede escribir código que una máquina entienda; los buenos programadores escriben código que los humanos entienden.",
    author: "Martin Fowler",
  },
  {
    text: "Es más fácil pedir perdón que pedir permiso.",
    author: "Grace Hopper",
  },
  {
    text: "Hablar es barato. Mostrame el código.",
    author: "Linus Torvalds",
  },
  {
    text: "La informática no trata sobre las computadoras, igual que la astronomía no trata sobre los telescopios.",
    author: "Edsger Dijkstra",
  },
  {
    text: "La simplicidad es un prerrequisito de la confiabilidad.",
    author: "Edsger Dijkstra",
  },
  {
    text: "Si querés ir rápido, andá solo; si querés llegar lejos, andá acompañado.",
    author: "Proverbio africano",
  },
  {
    text: "No por mucho madrugar amanece más temprano.",
    author: "Refrán español",
  },
  {
    text: "Quien mucho abarca, poco aprieta.",
    author: "Refrán español",
  },
  {
    text: "El mejor momento para plantar un árbol fue hace veinte años; el segundo mejor momento es ahora.",
    author: "Proverbio chino",
  },
  {
    text: "Cae siete veces, levantate ocho.",
    author: "Proverbio japonés",
  },
  {
    text: "La práctica no hace la perfección: la práctica hace lo permanente.",
    author: "Anónimo",
  },
];

// Picks a random quote, avoiding immediately repeating the last one.
export const getRandomQuote = (lastText) => {
  const bank = inPracticeLanguage({ es: quotes, en: englishQuotes });
  if (bank.length === 1) return bank[0];

  let quote;
  do {
    quote = bank[Math.floor(Math.random() * bank.length)];
  } while (quote.text === lastText);

  return quote;
};
