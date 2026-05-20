export type Nova AIPiCodingAgentSkillSourceAugmentation = never;

declare module "@earendil-works/pi-coding-agent" {
  interface Skill {
    // Nova AI relies on the source identifier returned by pi skill loaders.
    source: string;
  }
}
