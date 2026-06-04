export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Замінюємо пробіли на дефіси
    .replace(/[^\w-]+/g, '') // Видаляємо всі не-буквено-цифрові символи (крім дефісів)
    .replace(/--+/g, '-') // Замінюємо кілька дефісів підряд на один
    .replace(/^-+/, '') // Видаляємо дефіси на початку
    .replace(/-+$/, ''); // Видаляємо дефіси в кінці
}
