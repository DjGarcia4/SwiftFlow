// Manually curated bank of short code snippets for "code" mode. Written as
// explicit "\n"/indentation strings (rather than template literals) so the
// source file's own formatting can never accidentally leak extra
// whitespace into what gets typed.
export const codeSnippets = [
  {
    language: "JavaScript",
    code: "function factorial(n) {\n  if (n <= 1) {\n    return 1;\n  }\n  return n * factorial(n - 1);\n}",
  },
  {
    language: "JavaScript",
    code: "const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map((n) => n * 2);\nconsole.log(doubled);",
  },
  {
    language: "JavaScript",
    code: "class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n\n  speak() {\n    console.log(`${this.name} hace un sonido.`);\n  }\n}",
  },
  {
    language: "JavaScript",
    code: "async function fetchData(url) {\n  const response = await fetch(url);\n  const data = await response.json();\n  return data;\n}",
  },
  {
    language: "JavaScript",
    code: 'function isPalindrome(str) {\n  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}',
  },
  {
    language: "JavaScript",
    code: "const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};",
  },
  {
    language: "Python",
    code: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
  },
  {
    language: "Python",
    code: "def is_even(number):\n    return number % 2 == 0\n\nfor i in range(10):\n    if is_even(i):\n        print(i)",
  },
  {
    language: "Python",
    code: 'class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        print(f"{self.name} hace un sonido.")',
  },
  {
    language: "Python",
    code: "def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a",
  },
  {
    language: "Python",
    code: 'with open("data.txt", "r") as file:\n    lines = file.readlines()\n    for line in lines:\n        print(line.strip())',
  },
  {
    language: "Python",
    code: "numbers = [1, 2, 3, 4, 5]\nsquared = [n ** 2 for n in numbers]\nprint(squared)",
  },
  {
    language: "JavaScript",
    code: "function bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}",
  },
  {
    language: "JavaScript",
    code: 'function addTodo(list, task) {\n  return [...list, { task, done: false }];\n}\n\nconst todos = addTodo([], "Comprar leche");\nconsole.log(todos);',
  },
  {
    language: "JavaScript",
    code: 'function delay(ms) {\n  return new Promise((resolve) => {\n    setTimeout(resolve, ms);\n  });\n}\n\ndelay(1000).then(() => {\n  console.log("Listo!");\n});',
  },
  {
    language: "JavaScript",
    code: 'function greet({ name = "amigo", age } = {}) {\n  console.log(`Hola ${name}, tienes ${age} años.`);\n}\n\ngreet({ name: "Ana", age: 28 });',
  },
  {
    language: "JavaScript",
    code: "const cart = [10, 20, 30, 40];\nconst total = cart.reduce((sum, price) => sum + price, 0);\nconsole.log(`Total: $${total}`);",
  },
  {
    language: "JavaScript",
    code: 'const button = document.querySelector("button");\nbutton.addEventListener("click", () => {\n  console.log("Botón presionado");\n});',
  },
  {
    language: "Python",
    code: "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr",
  },
  {
    language: "Python",
    code: 'student = {"name": "Ana", "age": 22}\nfor key, value in student.items():\n    print(f"{key}: {value}")',
  },
  {
    language: "Python",
    code: 'def log_call(func):\n    def wrapper(*args, **kwargs):\n        print(f"Llamando a {func.__name__}")\n        return func(*args, **kwargs)\n    return wrapper',
  },
  {
    language: "Python",
    code: 'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("No se puede dividir por cero")\nfinally:\n    print("Operación finalizada")',
  },
  {
    language: "Python",
    code: "def count_up_to(n):\n    i = 1\n    while i <= n:\n        yield i\n        i += 1\n\nfor num in count_up_to(5):\n    print(num)",
  },
  {
    language: "Python",
    code: "def sum_list(numbers):\n    total = 0\n    for number in numbers:\n        total += number\n    return total",
  },
  {
    language: "Java",
    code: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hola, mundo!");\n  }\n}',
  },
  {
    language: "Java",
    code: "public class Factorial {\n  static int factorial(int n) {\n    if (n <= 1) {\n      return 1;\n    }\n    return n * factorial(n - 1);\n  }\n}",
  },
  {
    language: "Java",
    code: 'public class Animal {\n  private String name;\n\n  public Animal(String name) {\n    this.name = name;\n  }\n\n  public void speak() {\n    System.out.println(name + " hace un sonido.");\n  }\n}',
  },
  {
    language: "Java",
    code: "public class SumArray {\n  public static int sum(int[] numbers) {\n    int total = 0;\n    for (int number : numbers) {\n      total += number;\n    }\n    return total;\n  }\n}",
  },
  {
    language: "Java",
    code: 'import java.util.ArrayList;\n\nArrayList<String> names = new ArrayList<>();\nnames.add("Ana");\nnames.add("Luis");\nSystem.out.println(names);',
  },
  {
    language: "Java",
    code: "interface Shape {\n  double area();\n}\n\nclass Circle implements Shape {\n  double radius;\n\n  public double area() {\n    return Math.PI * radius * radius;\n  }\n}",
  },
  {
    language: "Java",
    code: 'public class Grade {\n  static String getGrade(int score) {\n    if (score >= 90) {\n      return "A";\n    } else if (score >= 70) {\n      return "B";\n    } else {\n      return "C";\n    }\n  }\n}',
  },
  {
    language: "Java",
    code: 'try {\n  int result = 10 / 0;\n} catch (ArithmeticException e) {\n  System.out.println("Error: " + e.getMessage());\n} finally {\n  System.out.println("Fin del bloque");\n}',
  },
  {
    language: "Java",
    code: "public class Countdown {\n  public static void run(int start) {\n    while (start > 0) {\n      System.out.println(start);\n      start--;\n    }\n  }\n}",
  },
  {
    language: "Java",
    code: 'import java.util.HashMap;\n\nHashMap<String, Integer> ages = new HashMap<>();\nages.put("Ana", 28);\nages.put("Luis", 35);\nSystem.out.println(ages.get("Ana"));',
  },
  {
    language: "Java",
    code: "public class Finder {\n  static boolean contains(int[] arr, int target) {\n    for (int value : arr) {\n      if (value == target) {\n        return true;\n      }\n    }\n    return false;\n  }\n}",
  },
  {
    language: "Java",
    code: 'class Vehicle {\n  void move() {\n    System.out.println("El vehículo se mueve");\n  }\n}\n\nclass Car extends Vehicle {\n  void honk() {\n    System.out.println("Beep beep");\n  }\n}',
  },
];

// Unique list of languages available, in the order they first appear above.
export const codeLanguages = [...new Set(codeSnippets.map((s) => s.language))];

// Picks a random snippet, avoiding immediately repeating the last one.
// Pass a `language` to restrict the pool to just that language ("Todos" /
// null / anything not matching a known language falls back to all of them).
export const getRandomCodeSnippet = (lastCode, language = null) => {
  const pool = language
    ? codeSnippets.filter((s) => s.language === language)
    : codeSnippets;
  const source = pool.length ? pool : codeSnippets;

  if (source.length === 1) return source[0];

  let snippet;
  do {
    snippet = source[Math.floor(Math.random() * source.length)];
  } while (snippet.code === lastCode);

  return snippet;
};
