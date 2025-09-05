// Test script for date parser
function parseDateString(dateStr) {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }
  
  // Remove any extra whitespace
  const cleanStr = dateStr.trim();
  
  // Try different date formats
  let date = null;
  
  // Format DD/MM/YYYY or DD/MM/YY
  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
  const ddmmyyyyMatch = cleanStr.match(ddmmyyyyRegex);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    let fullYear = year;
    if (year.length === 2) {
      // Convert 2-digit year to 4-digit (assuming 1900-2099)
      fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    }
    console.log(`Parsed DD/MM/YYYY: day=${day}, month=${month}, year=${fullYear}`);
    date = new Date(fullYear, month - 1, day);
  }
  
  // Format YYYY-MM-DD
  if (!date || isNaN(date.getTime())) {
    const yyyymmddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const yyyymmddMatch = cleanStr.match(yyyymmddRegex);
    if (yyyymmddMatch) {
      const [, year, month, day] = yyyymmddMatch;
      console.log(`Parsed YYYY-MM-DD: day=${day}, month=${month}, year=${year}`);
      date = new Date(year, month - 1, day);
    }
  }
  
  // Try parsing as-is if other formats fail
  if (!date || isNaN(date.getTime())) {
    console.log('Trying Date constructor with:', cleanStr);
    date = new Date(cleanStr);
  }
  
  // Validate the resulting date
  if (date && !isNaN(date.getTime())) {
    console.log('Valid date:', date);
    return date;
  }
  
  console.log('Invalid date');
  return null;
}

// Test cases
console.log('\n=== Testing Date Parser ===');
console.log('\n1. Testing "22/05/1998":');
const result1 = parseDateString('22/05/1998');

console.log('\n2. Testing "1998-05-22":');
const result2 = parseDateString('1998-05-22');

console.log('\n3. Testing "05/22/1998":');
const result3 = parseDateString('05/22/1998');

console.log('\n4. Testing empty string:');
const result4 = parseDateString('');

console.log('\n=== Results ===');
console.log('22/05/1998:', result1);
console.log('1998-05-22:', result2);
console.log('05/22/1998:', result3);
console.log('empty string:', result4);
