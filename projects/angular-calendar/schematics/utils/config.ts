import { Tree, SchematicsException } from '@angular-devkit/schematics';

const ANGULAR_CONFIG_PATH = 'angular.json';

export function addStyle(
  host: Tree,
  stylePath: string,
  projectName?: string
): void {
  const workspaceJson = JSON.parse(host.read(ANGULAR_CONFIG_PATH)!.toString());
  const name =
    projectName ||
    workspaceJson.defaultProject ||
    Object.keys(workspaceJson.projects)[0];
  const project = workspaceJson.projects[name];

  if (project && isAngularBrowserProject(project)) {
    project.architect.build.options.styles.unshift(stylePath);
    project.architect.test.options.styles.unshift(stylePath);

    writeConfig(host, workspaceJson);
  } else {
    throw new SchematicsException(`project configuration could not be found`);
  }
}

function writeConfig(host: Tree, config: any): void {
  const DEFAULT_ANGULAR_INDENTION = 2;
  host.overwrite(
    ANGULAR_CONFIG_PATH,
    JSON.stringify(config, null, DEFAULT_ANGULAR_INDENTION)
  );
}

function isAngularBrowserProject(projectConfig: any): boolean {
  if (projectConfig.projectType === 'application') {
    const buildConfig = projectConfig.architect.build;
    return buildConfig.builder === '@angular-devkit/build-angular:browser';
  }

  return false;
}
