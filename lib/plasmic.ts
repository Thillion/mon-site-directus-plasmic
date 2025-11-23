import { initPlasmicLoader } from '@plasmicapp/loader-nextjs/react-server-conditional';

// Initialize Plasmic loader - works on both client and server
export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: process.env.NEXT_PUBLIC_PLASMIC_PROJECT_ID || '',
      token: process.env.NEXT_PUBLIC_PLASMIC_PROJECT_API_TOKEN || '',
    },
  ],
  preview: false, // Set to false for production builds
});

// You can register custom React components here to use in Plasmic
// Example: PLASMIC.registerComponent(MyComponent, {...})
// For Directus integration, create code components in Plasmic Studio
// and use the Directus SDK functions (getArticles, getArticleBySlug) directly in those components
