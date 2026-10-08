export type Section = { title: string; text: string[]; items?: string[] };
export type Chapter = {
  title: string;
  headline: string;
  intro: string;
  duration: string;
  sections: Section[];
  key: string[];
};
