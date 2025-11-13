/* ===================================
   FORM HANDLER
   Handles form validation, interactions, and data collection
   =================================== */

class FormHandler {
    constructor() {
        this.form = document.getElementById('promptForm');
        this.multiselectFields = {
            mainBenefits: {
                display: document.getElementById('mainBenefitsTrigger'),
                dropdown: document.getElementById('mainBenefitsOptions'),
                otherInput: document.getElementById('mainBenefitsOther'),
                selectedValues: [],
                maxSelections: 3
            },
            secondaryBenefits: {
                display: document.getElementById('secondaryBenefitsTrigger'),
                dropdown: document.getElementById('secondaryBenefitsOptions'),
                otherInput: document.getElementById('secondaryBenefitsOther'),
                selectedValues: [],
                maxSelections: 3
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCharacterCounters();
        this.setupMultiselects();
    }

    setupEventListeners() {
        // Product Field "Other" option
        const productField = document.getElementById('productField');
        const productFieldOther = document.getElementById('productFieldOther');

        productField.addEventListener('change', (e) => {
            if (e.target.value === 'Other') {
                productFieldOther.classList.remove('hidden');
                productFieldOther.focus();
            } else {
                productFieldOther.classList.add('hidden');
                productFieldOther.value = '';
            }
        });

        // Target Audience "Other" option
        const targetAudience = document.getElementById('targetAudience');
        const targetAudienceOther = document.getElementById('targetAudienceOther');

        targetAudience.addEventListener('change', (e) => {
            if (e.target.value === 'Other') {
                targetAudienceOther.classList.remove('hidden');
                targetAudienceOther.focus();
            } else {
                targetAudienceOther.classList.add('hidden');
                targetAudienceOther.value = '';
            }
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    setupCharacterCounters() {
        // Product Description counter
        const productDesc = document.getElementById('productDescription');
        const productDescCounter = productDesc.parentElement.querySelector('.char-count');

        productDesc.addEventListener('input', (e) => {
            const length = e.target.value.length;
            productDescCounter.textContent = `${length}/150`;
        });

        // Challenges counter
        const challenges = document.getElementById('challenges');
        const challengesCounter = challenges.parentElement.querySelector('.char-count');

        challenges.addEventListener('input', (e) => {
            const length = e.target.value.length;
            challengesCounter.textContent = `${length}/150`;
        });
    }

    setupMultiselects() {
        Object.keys(this.multiselectFields).forEach(fieldName => {
            const field = this.multiselectFields[fieldName];

            // Toggle dropdown
            field.display.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(fieldName);
            });

            // Handle checkbox changes
            const checkboxes = field.dropdown.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.handleMultiselectChange(fieldName, e.target);
                });
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!field.display.contains(e.target) && !field.dropdown.contains(e.target)) {
                    field.dropdown.classList.add('hidden');
                    field.display.classList.remove('active');
                }
            });
        });
    }

    toggleDropdown(fieldName) {
        const field = this.multiselectFields[fieldName];
        const isHidden = field.dropdown.classList.contains('hidden');

        // Close all dropdowns first
        Object.values(this.multiselectFields).forEach(f => {
            f.dropdown.classList.add('hidden');
            f.display.classList.remove('active');
        });

        // Toggle current dropdown
        if (isHidden) {
            field.dropdown.classList.remove('hidden');
            field.display.classList.add('active');
        }
    }

    handleMultiselectChange(fieldName, checkbox) {
        const field = this.multiselectFields[fieldName];
        const value = checkbox.value;

        if (checkbox.checked) {
            // Check if max selections reached
            if (field.selectedValues.length >= field.maxSelections) {
                checkbox.checked = false;
                alert(`You can only select up to ${field.maxSelections} options.`);
                return;
            }

            // Add to selected values
            field.selectedValues.push(value);

            // Show "Other" input if selected
            if (value === 'Other') {
                field.otherInput.classList.remove('hidden');
                field.otherInput.focus();
            }
        } else {
            // Remove from selected values
            const index = field.selectedValues.indexOf(value);
            if (index > -1) {
                field.selectedValues.splice(index, 1);
            }

            // Hide "Other" input if deselected
            if (value === 'Other') {
                field.otherInput.classList.add('hidden');
                field.otherInput.value = '';
            }
        }

        this.updateMultiselectDisplay(fieldName);
        this.updateCheckboxStates(fieldName);
    }

    updateMultiselectDisplay(fieldName) {
        const field = this.multiselectFields[fieldName];

        // Clear current display
        field.display.innerHTML = '';

        if (field.selectedValues.length === 0) {
            const placeholder = document.createElement('span');
            placeholder.className = 'placeholder';
            placeholder.textContent = fieldName === 'mainBenefits' ? 'Select Benefit' :
                                     fieldName === 'secondaryBenefits' ? 'Select Benefit' :
                                     'Select Target Audience';
            field.display.appendChild(placeholder);
        } else {
            field.selectedValues.forEach(value => {
                const chip = document.createElement('span');
                chip.className = 'selected-chip chip-add';
                chip.innerHTML = `
                    ${value}
                    <span class="remove" data-value="${value}">×</span>
                `;

                // Remove chip on click
                chip.querySelector('.remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeChip(fieldName, value);
                });

                field.display.appendChild(chip);
            });
        }

        // Re-add dropdown arrow indicator
        const arrow = document.createElement('span');
        arrow.style.marginLeft = 'auto';
        arrow.style.fontSize = '12px';
        arrow.style.color = 'var(--gray-dark)';
        arrow.textContent = '▼';
        // Arrow is handled via CSS ::after, so no need to append
    }

    removeChip(fieldName, value) {
        const field = this.multiselectFields[fieldName];

        // Uncheck the checkbox
        const checkbox = Array.from(field.dropdown.querySelectorAll('input[type="checkbox"]'))
            .find(cb => cb.value === value);
        if (checkbox) {
            checkbox.checked = false;
        }

        // Remove from selected values
        const index = field.selectedValues.indexOf(value);
        if (index > -1) {
            field.selectedValues.splice(index, 1);
        }

        // Hide "Other" input if removed
        if (value === 'Other') {
            field.otherInput.classList.add('hidden');
            field.otherInput.value = '';
        }

        this.updateMultiselectDisplay(fieldName);
        this.updateCheckboxStates(fieldName);
    }

    updateCheckboxStates(fieldName) {
        const field = this.multiselectFields[fieldName];
        const checkboxes = field.dropdown.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            if (!checkbox.checked && field.selectedValues.length >= field.maxSelections) {
                checkbox.disabled = true;
                checkbox.parentElement.style.opacity = '0.5';
            } else {
                checkbox.disabled = false;
                checkbox.parentElement.style.opacity = '1';
            }
        });
    }

    validateForm() {
        let isValid = true;
        const errors = [];

        // Check required fields
        const productField = document.getElementById('productField').value;
        if (!productField) {
            errors.push('Please select your product field');
            isValid = false;
        }

        const productDescription = document.getElementById('productDescription').value.trim();
        if (!productDescription) {
            errors.push('Please describe your product');
            isValid = false;
        }

        const primaryGoal = document.getElementById('primaryGoal').value;
        if (!primaryGoal) {
            errors.push('Please select the primary goal');
            isValid = false;
        }

        // Check main messages (all 3 required)
        const mainMessage1 = document.getElementById('mainMessage1').value.trim();
        const mainMessage2 = document.getElementById('mainMessage2').value.trim();
        const mainMessage3 = document.getElementById('mainMessage3').value.trim();

        if (!mainMessage1 || !mainMessage2 || !mainMessage3) {
            errors.push('Please fill in all 3 main messages');
            isValid = false;
        }

        if (!isValid) {
            alert('Please fix the following errors:\n\n' + errors.join('\n'));
        }

        return isValid;
    }

    collectFormData() {
        const data = {
            productField: document.getElementById('productField').value,
            productFieldOther: document.getElementById('productFieldOther').value.trim(),
            productDescription: document.getElementById('productDescription').value.trim(),
            mainBenefits: this.multiselectFields.mainBenefits.selectedValues,
            mainBenefitsOther: document.getElementById('mainBenefitsOther').value.trim(),
            secondaryBenefits: this.multiselectFields.secondaryBenefits.selectedValues,
            secondaryBenefitsOther: document.getElementById('secondaryBenefitsOther').value.trim(),
            challenges: document.getElementById('challenges').value.trim(),
            primaryGoal: document.getElementById('primaryGoal').value,
            targetAudience: document.getElementById('targetAudience').value,
            targetAudienceOther: document.getElementById('targetAudienceOther').value.trim(),
            mainMessages: [
                document.getElementById('mainMessage1').value.trim(),
                document.getElementById('mainMessage2').value.trim(),
                document.getElementById('mainMessage3').value.trim()
            ],
            secondaryMessages: [
                document.getElementById('secondaryMessage1').value.trim(),
                document.getElementById('secondaryMessage2').value.trim(),
                document.getElementById('secondaryMessage3').value.trim()
            ].filter(msg => msg), // Filter out empty messages
            websiteLink: document.getElementById('websiteLink').value.trim()
        };

        return data;
    }

    handleSubmit() {
        if (!this.validateForm()) {
            return;
        }

        const formData = this.collectFormData();
        console.log('Form Data:', formData);

        // Trigger the app to handle submission
        if (window.app) {
            window.app.handleFormSubmission(formData);
        }
    }

    resetForm() {
        this.form.reset();

        // Reset multiselects
        Object.keys(this.multiselectFields).forEach(fieldName => {
            const field = this.multiselectFields[fieldName];
            field.selectedValues = [];
            this.updateMultiselectDisplay(fieldName);

            // Uncheck all checkboxes
            const checkboxes = field.dropdown.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = false;
                cb.disabled = false;
                cb.parentElement.style.opacity = '1';
            });

            // Hide other inputs
            field.otherInput.classList.add('hidden');
            field.otherInput.value = '';
        });

        // Hide product field other input
        document.getElementById('productFieldOther').classList.add('hidden');
        document.getElementById('productFieldOther').value = '';

        // Hide target audience other input
        document.getElementById('targetAudienceOther').classList.add('hidden');
        document.getElementById('targetAudienceOther').value = '';

        // Reset character counters
        document.querySelectorAll('.char-count').forEach(counter => {
            counter.textContent = '0/150';
        });
    }
}

// Initialize form handler when DOM is ready
let formHandler;
document.addEventListener('DOMContentLoaded', () => {
    formHandler = new FormHandler();
});
