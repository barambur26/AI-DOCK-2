export const projectService = {
  getProjects: jest.fn().mockResolvedValue([]),
  getProject: jest.fn(),
  getProjectSummary: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
};
