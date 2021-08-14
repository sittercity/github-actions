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

  constructor(s: string) {
    const sParts = s.split(':');
    if (sParts.length < 2) {
      throw new TypeError(`Invalid reference "${s}" - missing destination`);
    }

    this.output = sParts[0].trim();

    const ref = sParts.slice(1).join(':');
    const refParts = ref.split('/');
    switch (refParts.length) {
      // projects/<p>/secrets/<s>/versions/<v>
      case 6: {
        this.project = refParts[1];
        this.name = refParts[3];
        this.version = refParts[5];
        break;
      }
      // projects/<p>/secrets/<s>
      case 4: {
        this.project = refParts[1];
        this.name = refParts[3];
        this.version = 'latest';
        break;
      }
      // <p>/<s>/<v>
      case 3: {
        this.project = refParts[0];
        this.name = refParts[1];
        this.version = refParts[2];
        break;
      }
      // <p>/<s>
      case 2: {
        this.project = refParts[0];
        this.name = refParts[1];
        this.version = 'latest';
        break;
      }
      default: {
        throw new TypeError(`Invalid reference "${s}" - unknown format`);
      }
    }
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
