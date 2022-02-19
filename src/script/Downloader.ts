import download from "downloadjs";
import { firebase } from "./firebase";
import type { FullMetadata } from "@firebase/storage";
import type { HTMLListElement } from "./HTMLListElement";
import { displayByteSize } from "./displayByteSize";
import { id } from "./idGen";
import { decrypt, importKey } from "./crypt";

export class Downloader {
  private readonly downloadButtonEl: HTMLElement;
  private readonly downloadListEl: HTMLListElement;

  private constructor(
    private readonly path: string,
    private readonly url: string,
    meta: FullMetadata
  ) {
    if (location.hash.length > 4) {
      importKey(location.hash.substring(1));
    }

    this.downloadButtonEl = document.createElement("div");
    this.downloadButtonEl.id = "download";
    this.downloadButtonEl.className = "floating-button";
    this.downloadButtonEl.title = "Download";
    document.body.appendChild(this.downloadButtonEl);
    this.downloadButtonEl.addEventListener("click", () => {
      try {
        this.download();
      } catch (err) {
        alert("Download failed");
        console.error(err);
      }
    });

    if (meta.customMetadata && "files" in meta.customMetadata) {
      const files: Array<{ name: string; size: number }> = JSON.parse(
        meta.customMetadata.files
      );
      this.downloadListEl = document.createElement("ul");
      this.downloadListEl.id = "download-list";
      document.body.appendChild(this.downloadListEl);

      for (const file of files) {
        const li = document.createElement("li");

        const name = document.createElement("span");
        name.innerText = file.name;
        name.className = "name";
        li.appendChild(name);

        const size = document.createElement("span");
        size.innerText = displayByteSize(file.size);
        size.className = "size";
        li.appendChild(size);

        this.downloadListEl.appendChild(li);
      }
    }
  }

  public get fileName(): string {
    return this.path.split("/").pop() ?? id() + ".zip";
  }

  public async download() {
    const resp = await fetch(this.url);
    if (resp.status >= 200 && resp.status < 400) {
      const buffer = await resp.arrayBuffer();
      const decrypted = await decrypt(buffer);
      download(decrypted, this.fileName);
      this.delete();
      return true;
    } else {
      return false;
    }
  }

  public delete() {
    this.downloadButtonEl.remove();
    return firebase.delete(this.path);
  }

  public static try(path: string): Promise<Downloader | null> {
    if (path.length < 5) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      firebase
        .downloadUrl(path)
        .then((url) => {
          firebase
            .getMeta(path)
            .then((meta) => {
              resolve(new Downloader(path, url, meta));
            })
            .catch((err) => {
              console.error(err);
              resolve(null);
            });
        })
        .catch((err) => {
          console.error("Not a download url", err);
          alert(`File ${path} does not exist`);
          resolve(null);
        });
    });
  }
}
