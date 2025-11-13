/* ===================================
   MAIN APPLICATION
   Coordinates all components and manages state
   =================================== */

class App {
    constructor() {
        this.currentState = 'initial'; // initial, loading, result
        this.states = {
            initial: document.getElementById('initialState'),
            loading: document.getElementById('loadingState'),
            result: document.getElementById('resultState')
        };

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
        document.getElementById('copyButton').addEventListener('click', () => {
            outputHandler.copyToClipboard();
        });

        // Download button
        document.getElementById('downloadButton').addEventListener('click', () => {
            outputHandler.downloadJSON();
        });

        // New Prompt button
        document.getElementById('newPromptButton').addEventListener('click', () => {
            this.resetToInitialState();
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

        // Transition to loading state
        this.transitionToLoading();

        try {
            // Call API to generate prompt
            const response = await apiClient.generatePrompt(formData);

            // Simulate minimum loading time for better UX (2 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Stop loading animation
            this.stopLoadingTextRotation();

            // Transition to result state
            this.transitionToResult(response.generatedPrompt, formData);

        } catch (error) {
            console.error('Error generating prompt:', error);
            this.stopLoadingTextRotation();

            // Show error and return to initial state
            alert(`Error: ${error.message}\n\nPlease try again.`);
            this.transitionToInitial();
        }
    }

    transitionToLoading() {
        this.currentState = 'loading';

        // Hide initial state
        this.states.initial.classList.add('state-transition-out');

        setTimeout(() => {
            this.states.initial.classList.add('hidden');
            this.states.initial.classList.remove('state-transition-out');

            // Show loading state
            this.states.loading.classList.remove('hidden');
            this.states.loading.classList.add('state-transition-in');

            // Start loading text rotation
            this.startLoadingTextRotation();
        }, 400);
    }

    startLoadingTextRotation() {
        const loadingText = document.getElementById('loadingText');
        this.loadingTextIndex = 0;

        this.loadingInterval = setInterval(() => {
            loadingText.classList.add('loading-text-change');

            setTimeout(() => {
                this.loadingTextIndex = (this.loadingTextIndex + 1) % this.loadingTexts.length;
                loadingText.textContent = this.loadingTexts[this.loadingTextIndex];
                loadingText.classList.remove('loading-text-change');
            }, 1000);

        }, 2000);
    }

    stopLoadingTextRotation() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
    }

    transitionToResult(generatedPrompt, formData) {
        this.currentState = 'result';

        // Set data for output handler
        outputHandler.setData(generatedPrompt, formData);

        // Hide loading state
        this.states.loading.classList.add('state-transition-out');

        setTimeout(() => {
            this.states.loading.classList.add('hidden');
            this.states.loading.classList.remove('state-transition-out', 'state-transition-in');

            // Show result state
            const generatedPromptTextarea = document.getElementById('generatedPrompt');
            generatedPromptTextarea.value = generatedPrompt;

            this.states.result.classList.remove('hidden');
            this.states.result.classList.add('result-appear');
        }, 400);
    }

    transitionToInitial() {
        this.currentState = 'initial';

        // Hide loading state
        this.states.loading.classList.add('state-transition-out');

        setTimeout(() => {
            this.states.loading.classList.add('hidden');
            this.states.loading.classList.remove('state-transition-out', 'state-transition-in');

            // Show initial state
            this.states.initial.classList.remove('hidden');
            this.states.initial.classList.add('state-transition-in');

            setTimeout(() => {
                this.states.initial.classList.remove('state-transition-in');
            }, 400);
        }, 400);
    }

    resetToInitialState() {
        this.currentState = 'initial';

        // Hide result state
        this.states.result.classList.add('state-transition-out');

        setTimeout(() => {
            this.states.result.classList.add('hidden');
            this.states.result.classList.remove('state-transition-out', 'result-appear');

            // Show initial state
            this.states.initial.classList.remove('hidden');
            this.states.initial.classList.add('state-transition-in');

            // Reset form
            if (window.formHandler) {
                formHandler.resetForm();
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            setTimeout(() => {
                this.states.initial.classList.remove('state-transition-in');
            }, 400);
        }, 400);
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.app = app; // Make globally accessible for form handler
});
