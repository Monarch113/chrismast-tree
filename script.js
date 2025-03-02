(function () {
    function randomOpacity(element) {
        gsap.killTweensOf(element, { opacity: true });
        gsap.fromTo(element, { opacity: 1 }, { duration: 0.07, opacity: Math.random(), repeat: -1 });
    }

    function animateParticle() {
        if (!particlesEnabled) return;
        let particle = particles[particleIndex];
        gsap.set(particle, {
            x: gsap.getProperty(".pContainer", "x"),
            y: gsap.getProperty(".pContainer", "y"),
            scale: randomScale()
        });
        
        gsap.timeline()
            .to(particle, {
                duration: gsap.utils.random(0.61, 6),
                physics2D: {
                    velocity: gsap.utils.random(-23, 23),
                    angle: gsap.utils.random(-180, 180),
                    gravity: gsap.utils.random(-6, 50)
                },
                scale: 0,
                rotation: gsap.utils.random(-123, 360),
                ease: "power1",
                onStart: randomOpacity,
                onStartParams: [particle],
                onRepeat: function (p) {
                    gsap.set(p, { scale: randomScale() });
                },
                onRepeatParams: [particle]
            });
        
        particleIndex = (particleIndex + 1) % 201;
    }

    MorphSVGPlugin.convertToPath("polygon");
    const mainSVG = document.querySelector(".mainSVG");
    const sparkle = document.querySelector(".sparkle");
    
    const colors = ["#E8F6F8", "#ACE8F8", "#F6FBFE", "#A2CBDC", "#B74551", "#5DBA72", "#910B28", "#910B28", "#446D39"];
    const shapes = ["#star", "#circ", "#cross", "#heart"];
    let particles = [];
    let particleIndex = 0;
    let particlesEnabled = true;
    
    gsap.set("svg", { visibility: "visible" });
    gsap.set(sparkle, { transformOrigin: "50% 50%", y: -100 });
    
    function getPathPoints(selector) {
        let points = [];
        let rawPath = MotionPathPlugin.getRawPath(selector)[0];
        rawPath.forEach((_, index) => {
            if (index % 2) {
                points.push({ x: rawPath[2 * index], y: rawPath[2 * index + 1] });
            }
        });
        return points;
    }
    
    let treePathPoints = getPathPoints(".treePath");
    let treeBottomPathPoints = getPathPoints(".treeBottomPath");
    
    let mainTimeline = gsap.timeline({ delay: 0, repeat: 0 });
    let treeTimeline = gsap.timeline({ onUpdate: animateParticle });
    let randomScale = gsap.utils.random(0.5, 3, 0.001, true);
    
    (function createParticles() {
        for (let i = 0; i < 201; i++) {
            let particle = document.querySelector(shapes[i % shapes.length]).cloneNode(true);
            mainSVG.appendChild(particle);
            particle.setAttribute("fill", colors[i % colors.length]);
            particle.setAttribute("class", "particle");
            particles.push(particle);
            gsap.set(particle, { x: -100, y: -100, transformOrigin: "50% 50%" });
        }
    })();
    
    (function animateTree() {
        treeTimeline.to(".pContainer, .sparkle", {
            duration: 6,
            motionPath: { path: ".treePath", autoRotate: false },
            ease: "linear"
        }).to(".pContainer, .sparkle", {
            duration: 1,
            onStart: () => particlesEnabled = false,
            x: treeBottomPathPoints[0].x,
            y: treeBottomPathPoints[0].y
        }).to(".pContainer, .sparkle", {
            duration: 2,
            onStart: () => particlesEnabled = true,
            motionPath: { path: ".treeBottomPath", autoRotate: false },
            ease: "linear"
        }, "-=0").from(".treeBottomMask", {
            duration: 2,
            drawSVG: "0% 0%",
            stroke: "#FFF",
            ease: "linear"
        }, "-=2");
    })();
    
    mainTimeline.from([".treePathMask", ".treePotMask"], {
        drawSVG: "0% 0%",
        stroke: "#FFF",
        stagger: { each: 6 },
        duration: gsap.utils.wrap([6, 1, 2]),
        ease: "linear"
    }).from(".treeStar", {
        duration: 3,
        scaleY: 0,
        scaleX: 0.15,
        transformOrigin: "50% 50%",
        ease: "elastic(1,0.5)"
    }, "-=4").to(".sparkle", {
        duration: 3,
        opacity: 0,
        ease: "rough({strength: 2, points: 100, template: linear, taper: both, randomize: true, clamp: false})"
    }, "-=0").to(".treeStarOutline", {
        duration: 1,
        opacity: 1,
        ease: "rough({strength: 2, points: 16, template: linear, taper: none, randomize: true, clamp: false})"
    }, "+=1");
    
    mainTimeline.add(treeTimeline, 0);
    gsap.globalTimeline.timeScale(1.5);
    treeTimeline.vars.onComplete = function () {
        gsap.to("foreignObject", { opacity: 1 });
    };
})();
