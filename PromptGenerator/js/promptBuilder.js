/* ===================================
   PROMPT BUILDER
   Constructs the meta-prompt for Gemini AI (Browser Version)
   =================================== */

class PromptBuilder {
    constructor() {
        this.promptTemplate = `You are an expert product marketing consultant with deep expertise in B2B marketing and product positioning.

Your task is to create a comprehensive, strategic product brief based on the information provided below. This brief will be used by creative teams to develop compelling marketing content.

---

## PRODUCT INFORMATION

**Industry:** {industry}
**Product Description:** {productDescription}

---

## KEY VALUE PROPOSITIONS

**Primary Benefits:**
{mainBenefits}

**Secondary Benefits:**
{secondaryBenefits}

---

## CHALLENGES & CONSTRAINTS

{challenges}

---

## STRATEGIC OBJECTIVES

**Primary Content Goal:** {primaryGoal}
**Target Audience:** {targetAudience}

---

## CORE MESSAGING FRAMEWORK

**Main Messages (Priority 1):**
{mainMessages}

**Secondary Messages (Supporting):**
{secondaryMessages}

---

## REFERENCE MATERIALS

**Company Website:** {websiteLink}

---

## YOUR TASK

Based on the information above, create a comprehensive product brief that includes:

1. **Executive Summary**: A concise overview of the product and its market position
2. **Target Audience Analysis**: Deep dive into the audience's needs, pain points, and motivations
3. **Value Proposition**: Clear articulation of why this product matters to the target audience
4. **Key Messages**: Expanded messaging framework with supporting points
5. **Content Strategy Recommendations**: Specific suggestions for content types, channels, and approaches
6. **Competitive Differentiation**: How to position this product uniquely in the market
7. **Creative Direction**: Tone, style, and visual approach recommendations
8. **Success Metrics**: KPIs to track the effectiveness of the marketing content

The brief should be:
- **Professional and actionable** - Ready for immediate use by creative teams
- **Strategic and data-driven** - Based on audience insights and market understanding
- **Comprehensive yet concise** - Covering all essential elements without unnecessary fluff
- **Industry-specific** - Leveraging best practices for the {industry} sector
- **Goal-oriented** - Aligned with the primary objective of {primaryGoal}

Please create this brief now, ensuring it addresses the specific challenges mentioned and incorporates all the messaging points provided.`;
    }

    buildPrompt(formData) {
        // Extract and format data from form
        const industry = this.getIndustry(formData);
        const productDescription = formData.productDescription || 'Not provided';
        const mainBenefits = this.formatBenefits(formData.mainBenefits, formData.mainBenefitsOther);
        const secondaryBenefits = this.formatBenefits(formData.secondaryBenefits, formData.secondaryBenefitsOther);
        const challenges = formData.challenges || 'No specific challenges mentioned';
        const primaryGoal = formData.primaryGoal || 'Not specified';
        const targetAudience = this.formatTargetAudience(formData.targetAudience, formData.targetAudienceOther);
        const mainMessages = this.formatMessages(formData.mainMessages);
        const secondaryMessages = this.formatMessages(formData.secondaryMessages);
        const websiteLink = formData.websiteLink || 'Not provided';

        // Replace placeholders in template
        let prompt = this.promptTemplate
            .replace(/{industry}/g, industry)
            .replace(/{productDescription}/g, productDescription)
            .replace(/{mainBenefits}/g, mainBenefits)
            .replace(/{secondaryBenefits}/g, secondaryBenefits)
            .replace(/{challenges}/g, challenges)
            .replace(/{primaryGoal}/g, primaryGoal)
            .replace(/{targetAudience}/g, targetAudience)
            .replace(/{mainMessages}/g, mainMessages)
            .replace(/{secondaryMessages}/g, secondaryMessages)
            .replace(/{websiteLink}/g, websiteLink);

        return prompt;
    }

    getIndustry(formData) {
        if (formData.productField === 'Other' && formData.productFieldOther) {
            return formData.productFieldOther;
        }
        return formData.productField || 'Not specified';
    }

    formatBenefits(benefits, otherText) {
        if (!benefits || benefits.length === 0) {
            return 'None specified';
        }

        let formatted = benefits.map((benefit, index) => {
            if (benefit === 'Other' && otherText) {
                return `${index + 1}. ${otherText}`;
            }
            return `${index + 1}. ${benefit}`;
        }).join('\n');

        return formatted;
    }

    formatTargetAudience(audience, otherText) {
        if (!audience) {
            return 'Not specified';
        }

        // Handle both string and array formats
        if (typeof audience === 'string') {
            if (audience === 'Other' && otherText) {
                return otherText;
            }
            return audience;
        }

        // If it's an array
        if (Array.isArray(audience)) {
            let formatted = audience.map(aud => {
                if (aud === 'Other' && otherText) {
                    return otherText;
                }
                return aud;
            }).join(', ');
            return formatted;
        }

        return 'Not specified';
    }

    formatMessages(messages) {
        if (!messages || messages.length === 0) {
            return 'None provided';
        }

        const filteredMessages = messages.filter(msg => msg && msg.trim());

        if (filteredMessages.length === 0) {
            return 'None provided';
        }

        return filteredMessages.map((msg, index) => `${index + 1}. ${msg}`).join('\n');
    }

    // Generate a simple template-based prompt (fallback if Gemini fails)
    generateFallbackPrompt(formData) {
        const industry = this.getIndustry(formData);
        const goal = formData.primaryGoal || 'create marketing content';

        return `# Product Brief Template

## Overview
Create a comprehensive product brief for a ${industry} product with the primary goal to ${goal}.

## Product Description
${formData.productDescription}

## Key Benefits
${this.formatBenefits(formData.mainBenefits, formData.mainBenefitsOther)}

## Target Audience
${this.formatTargetAudience(formData.targetAudience, formData.targetAudienceOther)}

## Core Messages
${this.formatMessages(formData.mainMessages)}

## Challenges to Address
${formData.challenges || 'None specified'}

## Website Reference
${formData.websiteLink || 'Not provided'}

---

Use this information to develop targeted marketing materials that resonate with the target audience and achieve the stated goals.`;
    }
}

// Initialize prompt builder
const promptBuilder = new PromptBuilder();
