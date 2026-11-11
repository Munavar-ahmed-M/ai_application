// Initialize AOS Animation Library
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
    });

    // Dynamic Copyright Year
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = menuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.className = 'fa-solid fa-bars text-lg';
            } else {
                icon.className = 'fa-solid fa-xmark text-lg';
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                const icon = menuBtn.querySelector('i');
                icon.className = 'fa-solid fa-bars text-lg';
            });
        });
    }

    // Navbar background blur on scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('bg-[#050505]/95', 'shadow-lg');
            navbar.classList.remove('bg-[#050505]/80');
        } else {
            navbar.classList.remove('bg-[#050505]/95', 'shadow-lg');
            navbar.classList.add('bg-[#050505]/80');
        }
    });

    // Contact Form Submission Handler
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const formSuccess = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Loading state
            submitBtn.disabled = true;
            btnText.textContent = 'Sending Message...';
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

            setTimeout(() => {
                submitBtn.style.display = 'none';
                formSuccess.classList.remove('hidden');
                contactForm.reset();
            }, 1200);
        });
    }
});

// Project Modal Details Data
const projectData = {
    inventory: {
        title: "Inventory Management System",
        category: "Full-Stack SaaS",
        subtitle: "Built with Next.js, Supabase, and Tailwind CSS",
        description: "A robust, high-performance inventory management platform designed to track stock levels, manage product categories, monitor low-stock thresholds, and streamline operations in real-time.",
        features: [
            "Real-time database synchronization powered by Supabase & PostgreSQL",
            "Secure user authentication and Role-Based Access Control (RBAC)",
            "Lightning-fast server-side rendering and routing with Next.js App Router",
            "Sleek, modern, and responsive user interface styled with Tailwind CSS",
            "Advanced search, filtering, and automated low-stock alerting system"
        ],
        techStack: ["Next.js", "Supabase", "Tailwind CSS", "PostgreSQL", "Vercel"],
        role: "Full-Stack Developer",
        duration: "Designed & Developed by Munavar Ahmed"
    },
    aibuilder: {
        title: "AI Agent Website Builder",
        category: "AI & Automation",
        subtitle: "Built with JavaScript, Google APIs, and LLM Agents",
        description: "An autonomous AI agent application that takes natural language prompts from users and intelligently generates structured website layouts, components, and responsive styling on the fly.",
        features: [
            "Natural language to website structure generation using Google APIs",
            "Autonomous agent reasoning loops for design and content generation",
            "Modular JavaScript architecture with dynamic DOM rendering",
            "Customizable templates and instant live preview capabilities",
            "Optimized prompt engineering for accurate layout scaffolding"
        ],
        techStack: ["JavaScript (ES6+)", "Google APIs", "LLM Agents", "HTML5/CSS3", "REST APIs"],
        role: "Software Developer & AI Integrator",
        duration: "Designed & Developed by Munavar Ahmed"
    }
};

// Open Project Modal
function openProjectModal(projectId) {
    const modal = document.getElementById('project-modal');
    const wrapper = document.getElementById('modal-content-wrapper');
    const body = document.getElementById('modal-body');
    const data = projectData[projectId];

    if (!data) return;

    body.innerHTML = `
        <div class="flex items-center gap-2 mb-3">
            <span class="px-3 py-1 rounded-full bg-white text-black text-xs font-mono font-semibold">${data.category}</span>
            <span class="text-xs text-zinc-400 font-mono">${data.duration}</span>
        </div>
        <h3 class="text-2xl sm:text-3xl font-bold text-white mb-2">${data.title}</h3>
        <p class="text-zinc-400 text-sm font-mono mb-6">${data.subtitle}</p>
        
        <p class="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6">
            ${data.description}
        </p>

        <h4 class="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-3">Key Features & Architecture:</h4>
        <ul class="space-y-2 mb-8 text-zinc-300 text-sm">
            ${data.features.map(f => `<li class="flex items-start gap-2"><i class="fa-solid fa-check text-white mt-1"></i><span>${f}</span></li>`).join('')}
        </ul>

        <h4 class="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-3">Technologies Used:</h4>
        <div class="flex flex-wrap gap-2 mb-8">
            ${data.techStack.map(t => `<span class="px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-mono border border-zinc-800">${t}</span>`).join('')}
        </div>

        <div class="flex items-center justify-between pt-6 border-t border-zinc-800">
            <span class="text-xs text-zinc-400 font-mono">Role: ${data.role}</span>
            <button onclick="closeProjectModal()" class="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors">
                Close
            </button>
        </div>
    `;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        wrapper.classList.remove('scale-95');
        wrapper.classList.add('scale-100');
    }, 10);
    document.body.style.overflow = 'hidden';
}

// Close Project Modal
function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    const wrapper = document.getElementById('modal-content-wrapper');

    modal.classList.add('opacity-0');
    wrapper.classList.remove('scale-100');
    wrapper.classList.add('scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 300);
}

// Close modal on click outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('project-modal');
    if (e.target === modal) {
        closeProjectModal();
    }
});
