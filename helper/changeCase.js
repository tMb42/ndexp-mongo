// 1. Capitalize Each Word (Title Case)
function capitalizeWords(str) {
  if (typeof str !== 'string') return str; // Return as is if not a string

  // Remove trailing full stop and capitalize each word
  return str
    .replace(/\.$/, '')
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}



// 2. Sentence Case
function sentenceCase(str) {
  if (str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}

// 3. Camel Case
function toCamelCase(str) {
  if (str) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
  }
}

// 4. Snake Case
function toSnakeCase(str) {
  if (str) {
    return str.toLowerCase().replace(/\s+/g, '_');
  }
}

// 5. Kebab Case
function toKebabCase(str) {
  if (str) {
    return str.toLowerCase().replace(/\s+/g, '-');
  }
}

// 6. Uppercase All Letters
function toUpperCase(str) {
  if (str) {
    return str.toUpperCase();
  }
}

// 7. Lowercase All Letters
function toLowerCase(str) {
  if (str) {
    return str.toLowerCase();
  }
}

// Attach all functions to the global object
global.capitalizeWords = capitalizeWords;
global.sentenceCase = sentenceCase;
global.toCamelCase = toCamelCase;
global.toSnakeCase = toSnakeCase;
global.toKebabCase = toKebabCase;
global.toUpperCase = toUpperCase;
global.toLowerCase = toLowerCase;