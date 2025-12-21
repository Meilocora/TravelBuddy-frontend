export function generateColorsSet(length: number): string[] {
  const prettyColors = [
    '#8B0000', // Dark Red
    '#006400', // Dark Green
    '#00008B', // Dark Blue
    '#8B008B', // Dark Magenta
    '#654321', // Dark Brown
    '#2F4F4F', // Dark Slate Gray
    '#4B0082', // Indigo
    '#800000', // Maroon
    '#556B2F', // Dark Olive Green
    '#483D8B', // Dark Slate Blue
  ];

  // Repeat the colors if the requested length exceeds the available colors
  const colorsSet = [];
  for (let i = 0; i < length; i++) {
    colorsSet.push(prettyColors[i % prettyColors.length]);
  }

  return colorsSet;
}
