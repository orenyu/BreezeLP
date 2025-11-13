/* ===================================
   MAIN APPLICATION
   Coordinates all components and manages modals
   =================================== */

class App {
    constructor() {
        this.loadingModal = document.getElementById('loadingModal');
        this.resultModal = document.getElementById('resultModal');

        this.loadingTexts = [
            'Analyzing your product...',
            'Crafting your prompt...',
            'Almost ready...'
        ];

        this.loadingTextIndex = 0;
        this.loadingInterval = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.addFloatingAnimation();
        console.log('Breeze Prompt Generator initialized');
    }

    setupEventListeners() {
        // Copy button
        const copyButton = document.getElementById('copyButton');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                outputHandler.copyToClipboard();
            });
        }

        // Download button
        const downloadButton = document.getElementById('downloadButton');
        if (downloadButton) {
            downloadButton.addEventListener('click', () => {
                outputHandler.downloadJSON();
            });
        }

        // Close modal button
        const closeButton = document.getElementById('closeModal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closeResultModal();
            });
        }

        // Click outside modal to close
        this.resultModal.addEventListener('click', (e) => {
            if (e.target === this.resultModal) {
                this.closeResultModal();
            }
        });
    }

    addFloatingAnimation() {
        const bulbImage = document.querySelector('.bulb-image');
        if (bulbImage) {
            bulbImage.classList.add('floating');
        }
    }

    async handleFormSubmission(formData) {
        console.log('Form submitted:', formData);

        // Show loading modal
        this.showLoadingModal();

        try {
            // Call API to generate prompt
            const response = await apiClient.generatePrompt(formData);

            // Simulate minimum loading time for better UX (1 second)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Stop loading animation
            this.stopLoadingTextRotation();

            // Hide loading modal
            this.hideLoadingModal();

            // Show result modal
            this.showResultModal(response.generatedPrompt, formData);

        } catch (error) {
            console.error('Error generating prompt:', error);
            this.stopLoadingTextRotation();

            // Hide loading modal
            this.hideLoadingModal();

            // Show error
            alert(`Error: ${error.message}\n\nPlease try again.`);
        }
    }

    showLoadingModal() {
        this.loadingModal.classList.remove('hidden');
        this.startLoadingTextRotation();
    }

    hideLoadingModal() {
        this.loadingModal.classList.add('hidden');
        this.stopLoadingTextRotation();
    }

    startLoadingTextRotation() {
        const loadingText = document.getElementById('loadingText');
        this.loadingTextIndex = 0;

        this.loadingInterval = setInterval(() => {
            this.loadingTextIndex = (this.loadingTextIndex + 1) % this.loadingTexts.length;
            loadingText.textContent = this.loadingTexts[this.loadingTextIndex];
        }, 2000);
    }

    stopLoadingTextRotation() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
    }

    showResultModal(generatedPrompt, formData) {
        // Set data for output handler
        outputHandler.setData(generatedPrompt, formData);

        // Update textarea with generated prompt
        const generatedPromptTextarea = document.getElementById('generatedPrompt');
        generatedPromptTextarea.value = generatedPrompt;

        // Show modal
        this.resultModal.classList.remove('hidden');
    }

    closeResultModal() {
        this.resultModal.classList.add('hidden');
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.app = app; // Make globally accessible for form handler
});
