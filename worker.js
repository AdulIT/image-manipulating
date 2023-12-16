addEventListener('message', (d) =>
{
    const imageData = d.data.imageData;
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const gap = d.data.gap;
    let particlesArray = [];

    let red, green, blue, alpha, color
    for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
            red   = data[((x + y * width) * 4) + 0];
            green = data[((x + y * width) * 4) + 1];
            blue  = data[((x + y * width) * 4) + 2];
            alpha = data[((x + y * width) * 4) + 3];
            color = `rgba(${red}, ${green}, ${blue})`;

            if (alpha > 0) {
                particlesArray.push({x, y, color});
            }
        }
    }
    console.log(width);
    console.log(height);

    postMessage({ particlesArray });
});