document.body.classList.add("js-ready");

const currentYear = document.querySelector("#current-year");
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const revealItems = document.querySelectorAll("[data-reveal]");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const marqueeShell = document.querySelector(".marquee-shell");
function setupMarquee() {
  if (!marqueeShell) {
    return;
  }

  marqueeShell
    .querySelectorAll(".marquee-track[data-clone='true']")
    .forEach((track) => track.remove());

  const baseTrack = marqueeShell.querySelector(".marquee-track");
  if (!baseTrack) {
    return;
  }

  const clone = baseTrack.cloneNode(true);
  clone.dataset.clone = "true";
  clone.setAttribute("aria-hidden", "true");
  marqueeShell.appendChild(clone);

  const distance = Math.ceil(baseTrack.getBoundingClientRect().width);
  marqueeShell.style.setProperty("--marquee-distance", `${distance}px`);
}

setupMarquee();
window.addEventListener("resize", setupMarquee);
if (document.fonts?.ready) {
  document.fonts.ready.then(setupMarquee);
}

const projectRows = document.querySelectorAll(".project-row");
const preview = {
  index: document.querySelector(".preview-index"),
  kicker: document.querySelector(".preview-kicker"),
  title: document.querySelector(".preview-title"),
  body: document.querySelector(".preview-body"),
  meta: document.querySelector(".preview-meta"),
  link: document.querySelector(".preview-link"),
};

function updatePreview(row) {
  if (!row || !preview.index) {
    return;
  }

  projectRows.forEach((item) => item.classList.toggle("is-active", item === row));

  preview.index.textContent = row.dataset.index;
  preview.kicker.textContent = row.dataset.kicker;
  preview.title.textContent = row.dataset.title;
  preview.body.textContent = row.dataset.body;
  preview.link.href = row.dataset.link;

  const metaItems = row.dataset.meta.split("|");
  preview.meta.innerHTML = "";

  metaItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    preview.meta.appendChild(li);
  });
}

projectRows.forEach((row) => {
  row.addEventListener("mouseenter", () => updatePreview(row));
  row.addEventListener("focus", () => updatePreview(row));
  row.addEventListener("click", () => updatePreview(row));
});

const magnetItems = document.querySelectorAll(".magnet");

magnetItems.forEach((item) => {
  item.addEventListener("mousemove", (event) => {
    const rect = item.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    item.style.transform = `translate(${offsetX * 0.12}px, ${offsetY * 0.12}px)`;
  });

  item.addEventListener("mouseleave", () => {
    item.style.transform = "";
  });
});

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min((scrollTop / scrollable) * 100, 100) : 0;

  document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

const canvas = document.querySelector(".signal-canvas");
const hero = document.querySelector(".hero");

if (canvas && hero) {
  const context = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = {
    x: 0,
    y: 0,
    active: false,
  };
  let nodes = [];
  let animationFrameId = 0;

  function createNodes() {
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    const count = Math.max(26, Math.floor((width * height) / 21000));

    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: 1 + Math.random() * 2.4,
    }));
  }

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    createNodes();
  }

  function animate() {
    const width = hero.clientWidth;
    const height = hero.clientHeight;

    context.clearRect(0, 0, width, height);

    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x <= 0 || node.x >= width) {
        node.vx *= -1;
      }

      if (node.y <= 0 || node.y >= height) {
        node.vy *= -1;
      }

      if (pointer.active) {
        const dx = node.x - pointer.x;
        const dy = node.y - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 132 && distance > 0) {
          node.x += (dx / distance) * 0.8;
          node.y += (dy / distance) * 0.8;
        }
      }

      context.beginPath();
      context.fillStyle = node.size > 2.2 ? "rgba(255, 94, 45, 0.94)" : "rgba(18, 18, 18, 0.26)";
      context.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      context.fill();
    });

    for (let first = 0; first < nodes.length; first += 1) {
      for (let second = first + 1; second < nodes.length; second += 1) {
        const dx = nodes[first].x - nodes[second].x;
        const dy = nodes[first].y - nodes[second].y;
        const distance = Math.hypot(dx, dy);

        if (distance < 138) {
          context.beginPath();
          context.strokeStyle =
            distance < 82 ? "rgba(255, 94, 45, 0.18)" : "rgba(18, 18, 18, 0.08)";
          context.lineWidth = 1;
          context.moveTo(nodes[first].x, nodes[first].y);
          context.lineTo(nodes[second].x, nodes[second].y);
          context.stroke();
        }
      }
    }

    animationFrameId = window.requestAnimationFrame(animate);
  }

  function startCanvas() {
    if (prefersReducedMotion.matches) {
      context.clearRect(0, 0, hero.clientWidth, hero.clientHeight);
      return;
    }

    cancelAnimationFrame(animationFrameId);
    resizeCanvas();
    animate();
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });

  hero.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  window.addEventListener("resize", startCanvas);
  prefersReducedMotion.addEventListener("change", startCanvas);
  startCanvas();
}
