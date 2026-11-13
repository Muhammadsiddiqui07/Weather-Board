/**
 * Input validation rules for city queries
 */

export function validateCityInput(query) {
  const trimmed = (query || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      message: 'Please enter a city name to search (e.g., London, Tokyo, New York).',
    };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      message: 'City name must be at least 2 characters long.',
    };
  }

  if (trimmed.length > 60) {
    return {
      isValid: false,
      message: 'City name must be 60 characters or fewer.',
    };
  }

  // Allow letters, accented characters, spaces, hyphens, apostrophes, commas, and dots
  const validPattern = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s',.-]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      isValid: false,
      message: 'City names can only contain letters, spaces, hyphens, and apostrophes. Remove numbers or special characters.',
    };
  }

  return {
    isValid: true,
    message: null,
  };
}

