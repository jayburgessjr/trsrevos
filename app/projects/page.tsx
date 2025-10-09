import { listProjects, getProjectStats } from "@/core/projects/store";
import ProjectsPageClient from "./ProjectsPageClient";
import type { RevOSPhase } from "@/core/clients/types";

export type ProjectRowData = {
  name: string;
  clientId: string;
  clientName: string;
  owner: string;
  status: RevOSPhase;
  progress: number;
  dueDate: string;
  health: "green" | "yellow" | "red";
};

export default function ProjectsPage() {
  const projects = listProjects();
  const stats = getProjectStats();

  return <ProjectsPageClient projects={projects} stats={stats} />;
}
