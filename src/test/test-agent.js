import "dotenv/config";
import { runAgent } from "#src/agent/agent.js";

async function main() {
  try {
    const result = await runAgent({
      userMessage: `
        Build a responsive coffee shop landing page.
        Create index.html and style.css.
        Include a navbar, hero section, menu, and footer.
        Use HTML and CSS only.
      `,
      maxIterations: 15,
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Agent error:", error);
  }
}

main();
