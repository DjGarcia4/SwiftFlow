// "Clásicos": passages of Spanish-language literature old enough to be in
// the public domain everywhere. Prose keeps its paragraphs and verse its
// lines, each break a "\n" typed with Enter. Two things are adapted so
// every character can be typed on a keyboard: the dialogue dash (—) is a
// hyphen, and there are no «» quotes. Spelling follows modern editions.

export const classics = [
  {
    id: "quijote-1",
    author: "Miguel de Cervantes",
    work: "Don Quijote de la Mancha",
    text: "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.\nTenía en su casa una ama que pasaba de los cuarenta y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años. Era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza.",
  },
  {
    id: "quijote-molinos",
    author: "Miguel de Cervantes",
    work: "Don Quijote de la Mancha",
    text: "En esto, descubrieron treinta o cuarenta molinos de viento que hay en aquel campo, y así como don Quijote los vio, dijo a su escudero:\n-La ventura va guiando nuestras cosas mejor de lo que acertáramos a desear, porque ves allí, amigo Sancho Panza, donde se descubren treinta, o pocos más, desaforados gigantes, con quien pienso hacer batalla y quitarles a todos las vidas.\n-¿Qué gigantes? -dijo Sancho Panza.\n-Aquellos que allí ves -respondió su amo- de los brazos largos, que los suelen tener algunos de casi dos leguas.",
  },
  {
    id: "lazarillo",
    author: "Anónimo",
    work: "Lazarillo de Tormes",
    text: "Pues sepa Vuestra Merced ante todas cosas que a mí llaman Lázaro de Tormes, hijo de Tomé González y de Antona Pérez, naturales de Tejares, aldea de Salamanca. Mi nacimiento fue dentro del río Tormes, por la cual causa tomé el sobrenombre, y fue desta manera.\nMi padre, que Dios perdone, tenía cargo de proveer una molienda de una aceña que está ribera de aquel río, en la cual fue molinero más de quince años.",
  },
  {
    id: "becquer-liii",
    author: "Gustavo Adolfo Bécquer",
    work: "Rima LIII",
    text: "Volverán las oscuras golondrinas\nen tu balcón sus nidos a colgar,\ny otra vez con el ala a sus cristales\njugando llamarán.\nPero aquellas que el vuelo refrenaban\ntu hermosura y mi dicha a contemplar,\naquellas que aprendieron nuestros nombres...\n¡esas... no volverán!",
  },
  {
    id: "becquer-xxi",
    author: "Gustavo Adolfo Bécquer",
    work: "Rima XXI",
    text: "¿Qué es poesía?, dices mientras clavas\nen mi pupila tu pupila azul.\n¿Qué es poesía? ¿Y tú me lo preguntas?\nPoesía... eres tú.",
  },
  {
    id: "machado-caminante",
    author: "Antonio Machado",
    work: "Proverbios y cantares XXIX",
    text: "Caminante, son tus huellas\nel camino y nada más;\ncaminante, no hay camino,\nse hace camino al andar.\nAl andar se hace camino,\ny al volver la vista atrás\nse ve la senda que nunca\nse ha de volver a pisar.\nCaminante, no hay camino,\nsino estelas en la mar.",
  },
  {
    id: "marti-rosa",
    author: "José Martí",
    work: "Versos sencillos XXXIX",
    text: "Cultivo una rosa blanca,\nen junio como en enero,\npara el amigo sincero\nque me da su mano franca.\nY para el cruel que me arranca\nel corazón con que vivo,\ncardo ni ortiga cultivo:\ncultivo la rosa blanca.",
  },
  {
    id: "dario-sonatina",
    author: "Rubén Darío",
    work: "Sonatina",
    text: "La princesa está triste... ¿Qué tendrá la princesa?\nLos suspiros se escapan de su boca de fresa,\nque ha perdido la risa, que ha perdido el color.\nLa princesa está pálida en su silla de oro,\nestá mudo el teclado de su clave sonoro,\ny en un vaso olvidada se desmaya una flor.",
  },
  {
    id: "sor-juana-redondillas",
    author: "Sor Juana Inés de la Cruz",
    work: "Redondillas",
    text: "Hombres necios que acusáis\na la mujer sin razón,\nsin ver que sois la ocasión\nde lo mismo que culpáis:\nsi con ansia sin igual\nsolicitáis su desdén,\n¿por qué queréis que obren bien\nsi las incitáis al mal?",
  },
  {
    id: "manrique-coplas",
    author: "Jorge Manrique",
    work: "Coplas por la muerte de su padre",
    text: "Recuerde el alma dormida,\navive el seso y despierte\ncontemplando\ncómo se pasa la vida,\ncómo se viene la muerte\ntan callando,\ncuán presto se va el placer,\ncómo, después de acordado,\nda dolor;\ncómo, a nuestro parecer,\ncualquiera tiempo pasado\nfue mejor.",
  },
  {
    id: "espronceda-pirata",
    author: "José de Espronceda",
    work: "Canción del pirata",
    text: "Con diez cañones por banda,\nviento en popa, a toda vela,\nno corta el mar, sino vuela\nun velero bergantín;\nbajel pirata que llaman,\npor su bravura, el Temido,\nen todo mar conocido\ndel uno al otro confín.",
  },
  {
    id: "quevedo-nariz",
    author: "Francisco de Quevedo",
    work: "A una nariz",
    text: "Érase un hombre a una nariz pegado,\nérase una nariz superlativa,\nérase una nariz sayón y escriba,\nérase un peje espada muy barbado.",
  },
];

export const classicById = (id) => classics.find((passage) => passage.id === id) ?? null;

// Picks a passage, never the one just typed
export const getRandomClassic = (lastId, random = Math.random) => {
  if (classics.length === 1) return classics[0];
  let passage;
  do {
    passage = classics[Math.floor(random() * classics.length)];
  } while (passage.id === lastId);
  return passage;
};
