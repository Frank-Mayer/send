import download from "downloadjs";
import { firebase } from "./firebase";

export class Downloader {
  private constructor(
    private readonly path: string,
    private readonly url: string
  ) {}

  public download() {
    return new Promise<void>((resolve, reject) => {
      const resp = download(this.url);
      if (typeof resp === "boolean") {
        if (resp) {
          resolve();
        } else {
          reject();
        }
      } else {
        if (resp.status <= 299 && resp.status >= 200) {
          resolve();
        } else {
          resp.onloadend = () => {
            resolve();
          };

          resp.onerror = (ev) => {
            reject(ev);
          };
        }
      }
    });
  }

  public delete() {
    return firebase.delete(this.path).then(() => {
      location.pathname = "/";
    });
  }

  public static try(path: string): Promise<Downloader | null> {
    if (path.length < 5) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      firebase
        .downloadUrl(path)
        .then((url) => {
          resolve(new Downloader(path, url));
        })
        .catch((err) => {
          console.warn("Not a download url", err);
          resolve(null);
        });
    });
  }
}
