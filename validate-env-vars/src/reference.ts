/**
 * Parses a string of the format `outout:secret`. For example:
 *
 *     output:project/secret/version
 *
 * @param s String reference to parse
 * @returns Reference
 */
 export class Reference {
  // output is the name of the output variable.
  readonly output: string;

  // project, name, and version are the secret ref
  readonly project: string;
  readonly name: string;
  readonly version: string;

  constructor(project: string, secret: string) {
    this.output = `${project}-${secret}`;
    this.project = project;
    this.name = secret;
    this.version = 'latest';
  }

  /**
   * Returns the full GCP self link.
   *
   * @returns String self link.
   */
  public selfLink(): string {
    return `projects/${this.project}/secrets/${this.name}/versions/${this.version}`;
  }
}
