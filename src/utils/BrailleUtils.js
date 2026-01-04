/**
 * BrailleUtils - Helper for Braille mappings
 */

export const BrailleMappings = {
  letters: {
    "A": [1], "B": [1, 2], "C": [1, 4], "D": [1, 4, 5], "E": [1, 5],
    "F": [1, 2, 4], "G": [1, 2, 4, 5], "H": [1, 2, 5], "I": [2, 4],
    "J": [2, 4, 5], "K": [1, 3], "L": [1, 2, 3], "M": [1, 3, 4],
    "N": [1, 3, 4, 5], "O": [1, 3, 5], "P": [1, 2, 3, 4], "Q": [1, 2, 3, 4, 5],
    "R": [1, 2, 3, 5], "S": [2, 3, 4], "T": [2, 3, 4, 5], "U": [1, 3, 6],
    "V": [1, 2, 3, 6], "W": [2, 4, 5, 6], "X": [1, 3, 4, 6], "Y": [1, 3, 4, 5, 6],
    "Z": [1, 3, 5, 6]
  },
  numbers: {
    "1": [1], "2": [1, 2], "3": [1, 4], "4": [1, 4, 5],
    "5": [1, 5], "6": [1, 2, 4], "7": [1, 2, 4, 5], "8": [1, 2, 5],
    "9": [2, 4], "0": [2, 4, 5]
  }
};

export function getDotsForChar(char) {
  const upperChar = char.toUpperCase();
  if (BrailleMappings.letters[upperChar]) {
    return BrailleMappings.letters[upperChar];
  }
  if (BrailleMappings.numbers[upperChar]) {
    return BrailleMappings.numbers[upperChar];
  }
  return [];
}

export function getCharForDots(dots) {
  // Sort dots to ensure consistent comparison
  const sortedDots = [...dots].sort((a, b) => a - b);
  const jsonDots = JSON.stringify(sortedDots);

  for (const [char, d] of Object.entries(BrailleMappings.letters)) {
    if (JSON.stringify(d) === jsonDots) return char;
  }
  for (const [char, d] of Object.entries(BrailleMappings.numbers)) {
    if (JSON.stringify(d) === jsonDots) return char;
  }
  return null;
}
