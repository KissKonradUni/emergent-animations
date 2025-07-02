import { AsyncInit } from "../async.ts";

export class FloatingNavigator implements AsyncInit {
    private main: HTMLElement | null = null;
    private headers: HTMLElement[] | null = null;
    private navigation: HTMLElement | null = null;

    private links: HTMLAnchorElement[] = [];
    
    private heights: number[] = [];
    private currentSectionIndex: number = 0;

    public async init(): Promise<void> {
        console.log("🌟 Navigator initialized.");

        // Get all the necessary elements
        this.main = document.querySelector('main');
        this.headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];
        this.navigation = document.querySelector('aside#navigation');

        // Check if headers and navigation are found
        if (!this.main || !this.headers || !this.navigation) {
            console.error("🛑 Navigator initialization failed: no headers or navigator object found.");
            return;
        }

        // Create all the links for the navigation
        this.headers.forEach((section) => {
            const link = document.createElement('a');
            link.href = `#${section.id}`;
            link.textContent = section.textContent || "Unnamed Section";
            link.classList.add('nav-link');
            link.addEventListener('click', (event) => {
                event.preventDefault();
                globalThis.scrollTo({ behavior: 'smooth', top: section.offsetTop - 10 });
            });
            this.navigation?.appendChild(link);
            this.links.push(link);

            // Store the height of each section for later use
            this.heights.push(section.offsetTop);
        });

        // Add the active class to the first link
        if (this.links.length > 0) {
            this.links[0].classList.add('active');
        }

        // Add scroll event listener to highlight the current section
        globalThis.addEventListener('scroll', () => {
            const scrollPosition = globalThis.scrollY + 10; // Offset for better feel

            let newCurrentSectionIndex = 0;
            for (let i = 0; i < this.heights.length; i++) {
                if (scrollPosition >= this.heights[i]) {
                    newCurrentSectionIndex = i;
                } else {
                    break;
                }
            }

            if (newCurrentSectionIndex !== this.currentSectionIndex) {
                // Remove active class from the previous link
                const previousLink = this.links[this.currentSectionIndex];
                if (previousLink) {
                    previousLink.classList.remove('active');
                }

                // Add active class to the new link
                this.currentSectionIndex = newCurrentSectionIndex;
                const currentLink = this.links[this.currentSectionIndex];
                if (currentLink) {
                    currentLink.classList.add('active');
                }
            }
        });

        return;
    }

    public async destroy(): Promise<void> {
        console.log("🗑️ Navigator destroyed.");

        return;
    }

}