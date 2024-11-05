import { MarkdownView, TFile } from 'obsidian';

export class BacklinksView {
    private container: HTMLElement;
    private currentNoteName: string;

    constructor(private view: MarkdownView, currentNoteName: string) {
        this.currentNoteName = currentNoteName;
        this.container = this.createBacklinksContainer();
        console.log("Appending backlinks container to the view");

        // Append the container directly to the markdown view's content area
        const markdownContent = this.view.containerEl.querySelector('.markdown-preview-view') as HTMLElement || this.view.contentEl as HTMLElement;
        if (markdownContent) {
            // Ensure the parent container respects the readable line length
            markdownContent.style.setProperty('max-width', 'var(--readable-line-length, 800px)', 'important');
            markdownContent.style.setProperty('margin-left', 'auto', 'important');
            markdownContent.style.setProperty('margin-right', 'auto', 'important');
            markdownContent.appendChild(this.container);
        } else {
            console.warn("Markdown content area not found.");
        }
    }

    private createBacklinksContainer(): HTMLElement {
        const container = document.createElement('div');
        container.classList.add('custom-backlinks-container');
        container.style.borderTop = '1px solid var(--background-modifier-border)';
        container.style.marginTop = '20px';
        container.style.paddingTop = '10px';
        container.style.position = 'relative';
        container.style.zIndex = '10';
        container.style.backgroundColor = 'var(--background-primary)';
        container.style.color = 'var(--text-normal)';
        container.style.maxWidth = 'var(--readable-line-length)';
        container.style.marginLeft = 'auto';
        container.style.marginRight = 'auto';
        return container;
    }

    private async getFileContentPreview(filePath: string, currentNoteName: string): Promise<string> {
        try {
            const file = this.view.app.vault.getAbstractFileByPath(filePath);
            if (file && file instanceof TFile) {
                const content = await this.view.app.vault.read(file);
                const mentionIndex = content.indexOf('[[' + currentNoteName + ']]');

                if (mentionIndex !== -1) {
                    // Return content starting from the mention
                    const lines = content.substring(mentionIndex).split('---')[0]; // Get everything up to the first ---
                    return lines; // Directly return the string
                } else {
                    console.warn(`Current note name "${currentNoteName}" not found in file ${filePath}.`);
                    return "Current note name not found in file.";
                }
            }
        } catch (error) {
            console.error(`Error reading file content for ${filePath}:`, error);
        }
        return "Unable to fetch file content preview.";
    }

    public async updateBacklinks(filesLinkingToThis: string[], onLinkClick: (path: string) => void): Promise<void> {
        console.log("Updating backlinks:", filesLinkingToThis);
        this.container.empty();

        // Add header
        const header = this.container.createEl('h4', {
            text: `${filesLinkingToThis.length} Backlinks`
        });
        console.log("Header created:", header);

        // Use the current note name passed to the constructor
        const currentNoteName = this.currentNoteName;

        // Add backlinks
        const linksContainer = this.container.createDiv('backlinks-list');
        for (const sourcePath of filesLinkingToThis) {
            const linkEl = linksContainer.createDiv('backlink-item');
            const anchor = linkEl.createEl('a', {
                text: sourcePath,
                cls: 'internal-link',
            });
            console.log("Link element created:", anchor);

            anchor.addEventListener('click', (event) => {
                event.preventDefault();
                onLinkClick(sourcePath);
            });

            // Fetch and display a few lines of the file
            const fileContent = await this.getFileContentPreview(sourcePath, currentNoteName);
            const contentPreview = linkEl.createDiv('content-preview');
            contentPreview.textContent = fileContent;
        }

        console.log("Links container:", linksContainer);
    }

    clear() {
        // Remove the container from the DOM
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
        console.log("Backlinks view cleared");
    }
}
