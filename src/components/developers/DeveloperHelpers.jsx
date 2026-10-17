export function formatText(value) {
    if (!value) return "";
  
    return value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }