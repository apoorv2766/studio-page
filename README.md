# Page Studio

A lightweight WYSIWYG-lite content editor built with Next.js, Redux Toolkit, and Tailwind CSS.

## 1. Architecture Overview
This application uses a schema-driven approach. Pages are built using a standardized JSON representation defined by **Zod schemas**. The `sectionRegistry` maps these schemas to React components. 
- **Frontend:** Next.js (App Router) with Tailwind CSS and `shadcn/ui`.
- **State Management:** Redux Toolkit handles the editor's live draft state.
- **Validation:** Zod schemas ensure no malformed data crashes the application.

## 2. Redux Slice Responsibilities
- **`draftPageSlice`**: Holds the working draft of the page. It manages actions like adding, removing, reordering sections, and updating individual component props (e.g., changing hero text).
- **`uiSlice`**: Manages editor UI state, such as which section is currently active/selected, and the active user role (`viewer`, `editor`, `publisher`).
- **`publishSlice`**: Tracks the asynchronous state of publishing a page (loading, success, fail, last version).

## 3. Contentful Model + Adapter Explanation
To prevent Contentful-specific logic from leaking into our components, we implemented an Adapter pattern (`src/lib/contentfulClient.ts`). 
- **Model:** A Page contains `pageId`, `slug`, `title`, and an array of `sections` (Hero, FeatureGrid, CTA, Testimonial).
- **Adapter:** The adapter fetches data from the CMS and maps it cleanly to our strict Zod `PageSchema`. If the CMS schema changes, we only update the adapter, leaving UI components untouched.

## 4. Publish + SemVer Logic
When a publisher finalizes a draft, the system compares it against the last published JSON snapshot in the `releases/[slug]` directory. The deterministic diff logic (`src/lib/semver.ts`) assigns a version bump:
- **Major:** A section was removed or changed type.
- **Minor:** A section was added.
- **Patch:** Existing section props were modified.
The system then saves an immutable JSON file (e.g., `1.0.1.json`) to act as the source of truth for the live site.

## 5. Accessibility Evidence
The application is built with WCAG 2.2 AAA goals in mind:
- **`shadcn/ui` components** provide built-in ARIA attributes and keyboard operability.
- Focus states are highly visible across the editor and preview.
- **`axe-core`** is integrated into Playwright. It scans the rendered preview page and outputs an `a11y-report.json` artefact during CI. Any critical violations fail the build.

## 6. What is Incomplete and Why
Given the aggressive 7-hour sprint timeline:
- **Real Contentful Connection:** The adapter is mocked to return hardcoded assignment data. A real integration would require API keys and model setup on Contentful's end, which was omitted to ensure we hit the 10 PM delivery time.
- **Complex UI Polish:** The editor sidebar relies on basic inputs rather than complex drag-and-drop or rich text editors, prioritizing the correct Redux state management over advanced UI interactions.
- **Database Storage:** Releases are written to the local filesystem (`/releases`) instead of an S3 bucket or database to simplify the demonstration of the SemVer logic.

## Setup Instructions
```bash
npm install
npm run dev
```
Navigate to `http://localhost:3000/studio/home` to view the editor.
Navigate to `http://localhost:3000/preview/home` to view the live preview.
