/* ===================================
   OUTPUT HANDLER
   Handles copy-to-clipboard and JSON download
   =================================== */

class OutputHandler {
    constructor() {
        this.generatedPrompt = '';
        this.formData = null;
    }

    setData(prompt, formData) {
        this.generatedPrompt = prompt;
        this.formData = formData;
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.generatedPrompt);
            this.showCopySuccess();
            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            // Fallback method
            return this.fallbackCopy();
        }
    }

    fallbackCopy() {
        try {
            const textarea = document.getElementById('generatedPrompt');
            textarea.select();
            document.execCommand('copy');
            this.showCopySuccess();
            return true;
        } catch (error) {
            console.error('Fallback copy failed:', error);
            alert('Failed to copy to clipboard. Please copy manually.');
            return false;
        }
    }

    showCopySuccess() {
        const copyButton = document.getElementById('copyButton');
        const originalHTML = copyButton.innerHTML;

        // Show success state
        copyButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5" class="success-checkmark"/>
            </svg>
            Copied!
        `;
        copyButton.classList.add('button-press');

        // Reset after 2 seconds
        setTimeout(() => {
            copyButton.innerHTML = originalHTML;
            copyButton.classList.remove('button-press');
        }, 2000);
    }

    downloadJSON() {
        try {
            const jsonData = {
                generatedAt: new Date().toISOString(),
                formData: this.formData,
                generatedPrompt: this.generatedPrompt,
                metadata: {
                    version: '1.0',
                    generator: 'Breeze Animation Prompt Generator'
                }
            };

            const jsonString = JSON.stringify(jsonData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `breeze-prompt-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showDownloadSuccess();
            return true;

        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download JSON. Please try again.');
            return false;
        }
    }

    showDownloadSuccess() {
        const downloadButton = document.getElementById('downloadButton');
        const originalHTML = downloadButton.innerHTML;

        // Show success state
        downloadButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5" class="success-checkmark"/>
            </svg>
            Downloaded!
        `;
        downloadButton.classList.add('button-press');

        // Reset after 2 seconds
        setTimeout(() => {
            downloadButton.innerHTML = originalHTML;
            downloadButton.classList.remove('button-press');
        }, 2000);
    }
}

// Initialize output handler
const outputHandler = new OutputHandler();
