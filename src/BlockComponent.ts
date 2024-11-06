import { MarkdownRenderer, MarkdownView } from 'obsidian';

export class BlockComponent {
    constructor(
        public contents: string,
        public filePath: string,
        public noteName: string
    ) {}

    async render(container: HTMLElement, view: MarkdownView, onLinkClick: (path: string) => void): Promise<void> {
        const displayText = this.filePath.replace(/\.md$/, '');

        // Create a container for the display text and toggle button
        const headerContainer = container.createDiv({ cls: 'block-header' });

        // Create the toggle button
        const toggleButton = headerContainer.createEl('span', {
            cls: 'toggle-arrow',
            text: '▼', // Down-pointing arrow for open state
        });

        // Create the display text element
        const displayTextEl = headerContainer.createEl('a', {
            text: displayText,
            cls: 'display-text',
            href: '#',
        });

        displayTextEl.addEventListener('click', (event) => {
            event.preventDefault();
            onLinkClick(this.filePath);
        });

        // Create a block container with the class 'backlink-item'
        const blockContainer = container.createDiv({ cls: 'backlink-item' });

        // Render the markdown content
        const contentPreview = blockContainer.createDiv('content-preview');

        await MarkdownRenderer.render(
            view.app,
            this.contents,
            contentPreview,
            this.filePath,
            view,
        );

        // Initially show the entire block container
        blockContainer.style.display = 'block';

        // Add toggle functionality
        toggleButton.addEventListener('click', () => {
            const isCollapsed = blockContainer.style.display === 'none';
            blockContainer.style.display = isCollapsed ? 'block' : 'none';
            toggleButton.textContent = isCollapsed ? '▼' : '▶'; // Toggle arrow direction
        });
    }
}