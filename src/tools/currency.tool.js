export async function convertCurrency({ from, to, amount }) {
  from = from.toUpperCase();
  to = to.toUpperCase();

  const url = `https://api.frankfurter.dev/v2/rate/${from}/${to}`;

  console.log("Currency API URL:", url);

  const response = await fetch(url);

  const data = await response.json();

  console.log("Currency API status:", response.status);
  console.log("Currency API response:", data);

  if (!response.ok) {
    throw new Error(data.message || `Currency API error: ${response.status}`);
  }

  const convertedAmount = amount * data.rate;

  return {
    from,
    to,
    amount,
    rate: data.rate,
    convertedAmount,
    date: data.date,
  };
}
