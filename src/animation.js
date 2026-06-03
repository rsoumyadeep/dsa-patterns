/**
 * Lightweight, interactive background particle network.
 * Constellation network effect with mouse-repulsion physics.
 */
console.log("animation.js loaded.");

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    canvas.id = "bg-canvas";
    // Insert canvas as the first child of body to place it behind the D3 SVG graph
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext("2d");
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Handle resize
    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    // Dynamic particle density based on screen space
    const particleCount = Math.min(65, Math.floor((width * height) / 24000));

    const mouse = {
        x: null,
        y: null,
        radius: 130
    };

    // Track mouse coordinates on canvas area
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Drifting speed
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.baseRadius = Math.random() * 2 + 1.5;
            this.radius = this.baseRadius;
            
            // Saturated pastels for light theme visibility
            const colors = ["#60a5fa", "#b080f5", "#34d399", "#f59e0b", "#f87171"];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            // Apply mouse repulsion forces
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius; // Stronger force closer to mouse
                    const angle = Math.atan2(dy, dx);
                    // Smoothly push particle away
                    this.x += Math.cos(angle) * force * 2.0;
                    this.y += Math.sin(angle) * force * 2.0;
                }
            }

            // Continuous drift
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges with soft padding margin
            const margin = 10;
            if (this.x < -margin || this.x > width + margin) this.vx *= -1;
            if (this.y < -margin || this.y > height + margin) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.55; // Saturated overlay for light theme visibility
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections between close particles
        ctx.globalAlpha = 0.15; // Visible slate-grey connections
        ctx.lineWidth = 0.8;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

                if (dist < 110) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(100, 116, 139, ${1 - dist / 110})`;
                    ctx.stroke();
                }
            }
        }

        // Update positions and render
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
});
