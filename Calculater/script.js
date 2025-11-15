const convertButton = document.getElementById('convertButton');
const inputTemperature = document.getElementById('inputTemperature');
const result = document.getElementById('result');

convertButton.addEventListener('click', () => {
    const celsius = parseFloat(inputTemperature.value);
    if (!isNaN(celsius)) {
        const fahrenheit = (celsius * 9/5) + 32;
        result.textContent = `${celsius.toFixed(2)}°C is ${fahrenheit.toFixed(2)}°F`;
    } else {
        result.textContent = 'Please enter a valid temperature.';
    }
});
