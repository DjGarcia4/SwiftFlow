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
  {
    language: "TypeScript",
    code: "function factorial(n: number): number {\n  if (n <= 1) {\n    return 1;\n  }\n  return n * factorial(n - 1);\n}",
  },
  {
    language: "TypeScript",
    code: "const numbers: number[] = [1, 2, 3, 4, 5];\nconst doubled = numbers.map((n) => n * 2);\nconsole.log(doubled);",
  },
  {
    language: "TypeScript",
    code: "interface Speaker {\n  speak(): void;\n}\n\nclass Animal implements Speaker {\n  constructor(private name: string) {}\n\n  speak(): void {\n    console.log(`${this.name} hace un sonido.`);\n  }\n}",
  },
  {
    language: "TypeScript",
    code: "async function fetchData<T>(url: string): Promise<T> {\n  const response = await fetch(url);\n  const data: T = await response.json();\n  return data;\n}",
  },
  {
    language: "TypeScript",
    code: 'function isPalindrome(str: string): boolean {\n  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}',
  },
  {
    language: "TypeScript",
    code: "function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {\n  let timer: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}",
  },
  {
    language: "TypeScript",
    code: "function bubbleSort(arr: number[]): number[] {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}",
  },
  {
    language: "TypeScript",
    code: "interface Todo {\n  task: string;\n  done: boolean;\n}\n\nfunction addTodo(list: Todo[], task: string): Todo[] {\n  return [...list, { task, done: false }];\n}",
  },
  {
    language: "TypeScript",
    code: 'function delay(ms: number): Promise<void> {\n  return new Promise((resolve) => setTimeout(resolve, ms));\n}\n\ndelay(1000).then(() => {\n  console.log("Listo!");\n});',
  },
  {
    language: "TypeScript",
    code: 'type Person = { name: string; age: number };\n\nfunction greet({ name, age }: Person): void {\n  console.log(`Hola ${name}, tienes ${age} años.`);\n}\n\ngreet({ name: "Ana", age: 28 });',
  },
  {
    language: "Go",
    code: "func factorial(n int) int {\n\tif n <= 1 {\n\t\treturn 1\n\t}\n\treturn n * factorial(n-1)\n}",
  },
  {
    language: "Go",
    code: "numbers := []int{1, 2, 3, 4, 5}\ndoubled := make([]int, len(numbers))\nfor i, n := range numbers {\n\tdoubled[i] = n * 2\n}\nfmt.Println(doubled)",
  },
  {
    language: "Go",
    code: 'type Animal struct {\n\tName string\n}\n\nfunc (a Animal) Speak() {\n\tfmt.Printf("%s hace un sonido.\\n", a.Name)\n}',
  },
  {
    language: "Go",
    code: 'func worker(id int, ch chan<- string) {\n\tch <- fmt.Sprintf("worker %d terminó", id)\n}\n\nfunc main() {\n\tch := make(chan string)\n\tgo worker(1, ch)\n\tfmt.Println(<-ch)\n}',
  },
  {
    language: "Go",
    code: "func isPalindrome(s string) bool {\n\trunes := []rune(strings.ToLower(s))\n\tfor i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {\n\t\tif runes[i] != runes[j] {\n\t\t\treturn false\n\t\t}\n\t}\n\treturn true\n}",
  },
  {
    language: "Go",
    code: "func bubbleSort(arr []int) []int {\n\tfor i := 0; i < len(arr); i++ {\n\t\tfor j := 0; j < len(arr)-i-1; j++ {\n\t\t\tif arr[j] > arr[j+1] {\n\t\t\t\tarr[j], arr[j+1] = arr[j+1], arr[j]\n\t\t\t}\n\t\t}\n\t}\n\treturn arr\n}",
  },
  {
    language: "Go",
    code: 'ages := map[string]int{"Ana": 28, "Luis": 35}\nfor name, age := range ages {\n\tfmt.Printf("%s tiene %d años\\n", name, age)\n}',
  },
  {
    language: "Go",
    code: 'func divide(a, b float64) (float64, error) {\n\tif b == 0 {\n\t\treturn 0, errors.New("no se puede dividir por cero")\n\t}\n\treturn a / b, nil\n}',
  },
  {
    language: "Go",
    code: "func sum(numbers []int) int {\n\ttotal := 0\n\tfor _, n := range numbers {\n\t\ttotal += n\n\t}\n\treturn total\n}",
  },
  {
    language: "Go",
    code: "type Shape interface {\n\tArea() float64\n}\n\ntype Circle struct {\n\tRadius float64\n}\n\nfunc (c Circle) Area() float64 {\n\treturn math.Pi * c.Radius * c.Radius\n}",
  },
  {
    language: "Rust",
    code: "fn factorial(n: u64) -> u64 {\n    if n <= 1 {\n        1\n    } else {\n        n * factorial(n - 1)\n    }\n}",
  },
  {
    language: "Rust",
    code: 'let numbers = vec![1, 2, 3, 4, 5];\nlet doubled: Vec<i32> = numbers.iter().map(|n| n * 2).collect();\nprintln!("{:?}", doubled);',
  },
  {
    language: "Rust",
    code: 'struct Animal {\n    name: String,\n}\n\nimpl Animal {\n    fn speak(&self) {\n        println!("{} hace un sonido.", self.name);\n    }\n}',
  },
  {
    language: "Rust",
    code: 'fn divide(a: f64, b: f64) -> Result<f64, String> {\n    if b == 0.0 {\n        Err(String::from("no se puede dividir por cero"))\n    } else {\n        Ok(a / b)\n    }\n}',
  },
  {
    language: "Rust",
    code: "fn is_palindrome(s: &str) -> bool {\n    let clean: String = s.to_lowercase().chars().filter(|c| c.is_alphanumeric()).collect();\n    clean == clean.chars().rev().collect::<String>()\n}",
  },
  {
    language: "Rust",
    code: "fn bubble_sort(arr: &mut Vec<i32>) {\n    let n = arr.len();\n    for i in 0..n {\n        for j in 0..n - i - 1 {\n            if arr[j] > arr[j + 1] {\n                arr.swap(j, j + 1);\n            }\n        }\n    }\n}",
  },
  {
    language: "Rust",
    code: 'use std::collections::HashMap;\n\nlet mut ages = HashMap::new();\nages.insert("Ana", 28);\nages.insert("Luis", 35);\n\nfor (name, age) in &ages {\n    println!("{}: {}", name, age);\n}',
  },
  {
    language: "Rust",
    code: 'let add = |a: i32, b: i32| -> i32 { a + b };\nlet result = add(3, 4);\nprintln!("Resultado: {}", result);',
  },
  {
    language: "Rust",
    code: "fn sum(numbers: &[i32]) -> i32 {\n    numbers.iter().fold(0, |total, n| total + n)\n}",
  },
  {
    language: "Rust",
    code: "trait Shape {\n    fn area(&self) -> f64;\n}\n\nstruct Circle {\n    radius: f64,\n}\n\nimpl Shape for Circle {\n    fn area(&self) -> f64 {\n        std::f64::consts::PI * self.radius * self.radius\n    }\n}",
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
