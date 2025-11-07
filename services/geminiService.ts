import { GoogleGenAI, Type, Part } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const JIRA_STORY_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A concise, descriptive title for the user story."
      },
      userStory: {
        type: Type.STRING,
        description: "The user story in the format: 'As a [user type], I want to [goal] so that [benefit]'."
      },
      acceptanceCriteria: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        },
        description: "A list of acceptance criteria that must be met for the story to be considered complete."
      },
      bddScenarios: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING, description: "A descriptive title for the BDD scenario." },
            given: { type: Type.STRING, description: "The 'Given' part of the BDD scenario, describing the initial context." },
            when: { type: Type.STRING, description: "The 'When' part of the BDD scenario, describing the action taken by the user." },
            then: { type: Type.STRING, description: "The 'Then' part of the BDD scenario, describing the expected outcome." }
          },
          required: ["scenario", "given", "when", "then"]
        },
        description: "A list of Behavior-Driven Development (BDD) scenarios in Given-When-Then format."
      }
    },
    required: ["title", "userStory", "acceptanceCriteria", "bddScenarios"]
};

const JIRA_EPICS_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            epicTitle: {
                type: Type.STRING,
                description: "A high-level title for the epic or feature that groups related user stories."
            },
            stories: {
                type: Type.ARRAY,
                items: JIRA_STORY_SCHEMA
            }
        },
        required: ["epicTitle", "stories"]
    }
};


interface ImagePart {
    inlineData: {
        data: string;
        mimeType: string;
    };
}

export const generateUIPrototype = async (requirements: string, image?: ImagePart): Promise<string> => {
  let prompt = `
    You are a world-class senior frontend engineer and UI/UX designer.
    Based on the following user requirements${image ? ' and the provided wireframe image' : ''}, generate a complete, single HTML structure that represents a modern UI wireframe.
    
    Instructions:
    1. Use ONLY Tailwind CSS for all styling. Do not include any <style> tags, custom CSS classes, or inline style attributes.
    2. The output should be only the HTML code for the body content. Do not include <html>, <head>, or <body> tags.
    3. Create a visually appealing, clean, and modern layout. Use placeholder content where necessary.
    4. Ensure the UI is responsive and well-structured.
    5. Pay attention to spacing, typography, and component hierarchy.
    6. Use SVG icons from a library like Heroicons (inline SVG) for any icons if needed.
    ${image ? '\n    7. The provided image is a wireframe or inspiration. Your generated UI should be a high-fidelity implementation based on its layout and components.' : ''}

    User Requirements:
    "${requirements}"
  `;
  if (!requirements && image) {
      prompt = `
        You are a world-class senior frontend engineer and UI/UX designer.
        Based on the provided wireframe image, generate a complete, single HTML structure that represents a modern, high-fidelity UI wireframe.
        
        Instructions:
        1. Use ONLY Tailwind CSS for all styling. Do not include any <style> tags, custom CSS classes, or inline style attributes.
        2. The output should be only the HTML code for the body content. Do not include <html>, <head>, or <body> tags.
        3. Create a visually appealing, clean, and modern layout. Fill in placeholder content where necessary (e.g., names, descriptions, numbers).
        4. Ensure the UI is responsive and well-structured.
        5. Pay attention to spacing, typography, and component hierarchy.
        6. Use SVG icons from a library like Heroicons (inline SVG) for any icons if needed.
        7. The provided image is a wireframe. Your task is to turn it into a high-fidelity implementation.
      `;
  }
  
  const parts: Part[] = [{ text: prompt }];
  if (image) {
    parts.push(image);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating UI prototype:", error);
    throw new Error("Failed to generate UI prototype.");
  }
};

export const generateJiraStories = async (requirements: string, image?: ImagePart): Promise<string> => {
  let prompt = `
    You are an expert Agile Product Owner.
    Analyze the following user requirements${image ? ' and the provided wireframe image' : ''} and break them down into a list of high-level features or epics. 
    For each epic, define the necessary Jira-style user stories that fall under it.
    For each user story, provide a title, the story itself (in the 'As a..., I want..., so that...' format), detailed acceptance criteria, and at least one BDD scenario (Given-When-Then).
    
    User Requirements:
    "${requirements}"
  `;

  if (!requirements && image) {
      prompt = `
        You are an expert Agile Product Owner.
        Analyze the provided wireframe image and break it down into a list of high-level features or epics required to build the interface shown.
        For each epic, define the necessary Jira-style user stories that fall under it.
        For each user story, provide a title, the story itself (in the 'As a..., I want..., so that...' format), detailed acceptance criteria, and at least one BDD scenario (Given-When-Then).
      `;
  }

  const parts: Part[] = [{ text: prompt }];
  if (image) {
    parts.push(image);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: JIRA_EPICS_SCHEMA,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating Jira stories:", error);
    throw new Error("Failed to generate Jira stories.");
  }
};

export const refineUIPrototype = async (currentHtml: string, instruction: string): Promise<string> => {
    const prompt = `
      You are a world-class senior frontend engineer specializing in Tailwind CSS.
      You will be given an existing block of HTML code that uses Tailwind CSS and a user's instruction for how to modify it.
      Your task is to apply the user's requested changes and return the **complete, new HTML code for the body content**.

      Instructions:
      1.  Analyze the provided HTML and the user's instruction carefully.
      2.  Modify the HTML to implement the change. This might involve adding, removing, or altering elements and classes.
      3.  Ensure the output is ONLY the modified HTML code for the body content. Do not include \`\`\`html, <html>, <head>, <body> tags, or any explanations.
      4.  Maintain the use of ONLY Tailwind CSS for styling.

      **Existing HTML Code:**
      \`\`\`html
      ${currentHtml}
      \`\`\`

      **User's Instruction:**
      "${instruction}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [{ text: prompt }] },
        });
        return response.text;
    } catch (error) {
        console.error("Error refining UI prototype:", error);
        throw new Error("Failed to refine UI prototype.");
    }
};

export const generateUIVariant = async (requirements: string, originalUiCode: string, image?: ImagePart): Promise<string> => {
    let prompt = `
      You are a world-class senior frontend engineer and UI/UX designer.
      A UI has already been generated for the user's requirements. Your task is to create a **new and distinctly different UI variant**.
      Analyze the requirements and the previous UI, then generate a fresh alternative. Think about different layouts, color schemes, or component styles.

      Instructions:
      1. Use ONLY Tailwind CSS for all styling.
      2. The output should be only the HTML code for the body content. Do not include <html>, <head>, or <body> tags.
      3. Create a visually appealing, clean, and modern layout that is a clear alternative to the previous version.
      4. Ensure the UI is responsive and well-structured.

      **User Requirements:**
      "${requirements}"
      
      ${image ? '**Reference Image:**\n[Image was provided]' : ''}

      **Previous UI Version (to avoid duplicating):**
      \`\`\`html
      ${originalUiCode}
      \`\`\`
    `;

    const parts: Part[] = [{ text: prompt }];
    if (image) {
      parts.push(image);
    }
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts },
      });
      return response.text;
    }
    catch (error)
    {
      console.error("Error generating UI variant:", error);
      throw new Error("Failed to generate UI variant.");
    }
};
