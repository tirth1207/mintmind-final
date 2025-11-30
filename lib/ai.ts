import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile } from "@/types";
import Constants from "expo-constants";

const apiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY;
console.log(apiKey);

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function getFinancialAdvice(
  userMessage: string,
  userProfile: UserProfile | null
): Promise<string> {
  const contextInfo = userProfile
    ? `User's Financial Profile:
- Monthly Income: ₹${userProfile.monthlyIncome.toLocaleString("en-IN")}
- Monthly Expenses: ₹${userProfile.monthlyExpenses.toLocaleString("en-IN")}
- Travel Cost: ₹${userProfile.travelCost.toLocaleString("en-IN")}
- Food/Snacks: ₹${userProfile.foodSnacks.toLocaleString("en-IN")}
- Random Expenses: ₹${userProfile.randomExpenses.toLocaleString("en-IN")}
- SIP Goal: ₹${userProfile.sipGoal.toLocaleString("en-IN")}
- Risk Level: ${userProfile.riskLevel}
- Monthly Surplus: ₹${(
        userProfile.monthlyIncome - userProfile.monthlyExpenses
      ).toLocaleString("en-IN")}`
    : "User profile not available.";

  const systemPrompt = `
You are MintMind AI, a friendly and knowledgeable financial advisor specializing in Indian personal finance, budgeting, SIP, EMI calculations, and wealth planning.

Your role:
• Provide clear, actionable financial advice  
• Use Indian context and rupee (₹)  
• Explain calculations step-by-step  
• Keep the tone encouraging and supportive  
• Max 300 words  

${contextInfo}

User query: ${userMessage}
`;

  try {
    const result = await model.generateContent(systemPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "I'm having trouble right now. Please try again soon!";
  }
}

export async function getPersonalizedBudgetAdvice(
  userProfile: UserProfile
): Promise<string> {
  const surplus = userProfile.monthlyIncome - userProfile.monthlyExpenses;

  const prompt = `
Act as a financial advisor. Analyze the profile and give personalized budgeting guidance:

Monthly Income: ₹${userProfile.monthlyIncome.toLocaleString("en-IN")}
Monthly Expenses: ₹${userProfile.monthlyExpenses.toLocaleString("en-IN")}
Monthly Surplus: ₹${surplus.toLocaleString("en-IN")}
Travel Cost: ₹${userProfile.travelCost.toLocaleString("en-IN")}
Food/Snacks: ₹${userProfile.foodSnacks.toLocaleString("en-IN")}
Random Expenses: ₹${userProfile.randomExpenses.toLocaleString("en-IN")}
SIP Goal: ₹${userProfile.sipGoal.toLocaleString("en-IN")}
Risk Level: ${userProfile.riskLevel}

Provide:
1) Short assessment of financial health  
2) Areas to optimize  
3) Recommended SIP amount considering surplus + risk level  
4) One practical improvement tip  

Max: 250 words. Tone: supportive and clear.
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Unable to generate personalized advice right now.";
  }
}
