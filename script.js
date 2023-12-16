window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const worker = new Worker('worker.js');

    let particlesArray = [];
    const image = document.getElementById('img1');
    const gap = 7;
    const mouse = {
        radius: 3000,
        x: undefined,
        y: undefined,
    };

    window.addEventListener('mousemove', event => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    function createParticle(x, y, color) {
        const particle = {
            x: Math.random() * canvas.width,
            y: 0,
            originX: Math.floor(x),
            originY: Math.floor(y),
            color: color,
            size: gap,
            vx: 0,
            vy: 0,
            ease: 0.1,
            friction: 0.95,
            dx: 0,
            dy: 0,
            distance: 0,
            force: 0,
            angle: 0,
            draw: function(context) {
                context.fillStyle = this.color;
                context.fillRect(this.x, this.y, this.size, this.size);
            },
            update: function() {
                /**
                 * Distance between particle and mouse cursor
                 * dx - distance of x axis
                 * dy - distance of y axis
                 * distance - excutes by Pythagorean theorem
                 */
                this.dx = mouse.x - this.x;
                this.dy = mouse.y - this.y;
                this.distance = (this.dx * this.dx + this.dy * this.dy);
                /**
                 * Можно убрать минус, но делайте на свой страх и риск,
                 * т.к. результат вас не порадует, лично у меня результат вызывает неприязнь
                 * На этом этапе мой английский покинул меня 😅
                 * на остальное хватило 😅
                 */
                this.force = -mouse.radius / this.distance;

                if (this.distance - mouse.radius) {
                    this.angle = Math.atan2(this.dy, this.dx); // Math.atan2 - returns a numeric value in radians between minus PI and plus PI
                    this.vx += this.force * Math.cos(this.angle);
                    this.vy += this.force * Math.sin(this.angle);
                }
                /**
                 * Обновление позиции частиц по оси x и y
                 */
                this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
                this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
            },
            warp: function() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.ease = 0.08;
            },
        };
        return particle;
    }

    function init(context) {
        context.drawImage(image, (canvas.width - image.width) * 0.5, (canvas.height - image.height) * 0.5);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

        worker.addEventListener('message', (d) =>
        {
            const imageData = d.data;
            console.log(imageData.particlesArray);
            for (let i = 0; i < imageData.particlesArray.length; i++)
            {

                createParticle(imageData.particlesArray[i].x, imageData.particlesArray[i].y, imageData.particlesArray[i].color)
            }
        })

        worker.postMessage({
            imageData: {
                data: pixels,
                width: canvas.width,
                height: canvas.height,
            },
            gap,
        });

        for (let y = 0; y < canvas.height; y += gap) {
            for (let x = 0; x < canvas.width; x += gap) {
                const index = (y * canvas.width + x) * 4;
                const red = pixels[index + 0];
                const green = pixels[index + 1];
                const blue = pixels[index + 2];
                const alpha = pixels[index + 3];
                const color = `rgba(${red}, ${green}, ${blue})`;

                if (alpha > 0) {
                    particlesArray.push(createParticle(x, y, color));
                }
            }
        }
    }

    function draw(context) {
        particlesArray.forEach(particle => particle.draw(context));
    }

    function update() {
        particlesArray.forEach(particle => particle.update());
    }

    function warp() {
        particlesArray.forEach(particle => particle.warp());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw(ctx);
        update();
        requestAnimationFrame(animate);
    }

    init(ctx);
    animate();

    const warpButton = document.getElementById('warpBtn');
    warpButton.addEventListener('click', function() {
        warp();
    });
});
