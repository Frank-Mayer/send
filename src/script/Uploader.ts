import { downloadZip } from "client-zip";
import { firebase } from "./firebase";
import { id } from "./idGen";

type HTMLListElement = HTMLUListElement | HTMLOListElement;

export class Uploader {
  private readonly fileInputEl: HTMLInputElement;
  private readonly uploadListEl: HTMLListElement;
  private readonly sendButtonEl: HTMLElement;

  constructor() {
    this.uploadListEl = document.createElement("ul");
    this.uploadListEl.id = "upload";
    document.body.appendChild(this.uploadListEl);

    this.sendButtonEl = document.createElement("div");
    this.sendButtonEl.id = "send";
    this.sendButtonEl.title = "Send";
    this.sendButtonEl.style.display = "none";
    document.body.appendChild(this.sendButtonEl);
    this.sendButtonEl.addEventListener("click", () => {
      this.send();
    });

    this.fileInputEl = document.createElement("input");
    this.fileInputEl.title = "Upload";
    this.fileInputEl.type = "file";
    this.fileInputEl.multiple = true;

    this.fileInputEl.addEventListener("change", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.onUpload();
    });

    document.body.appendChild(this.fileInputEl);
  }

  private onUpload() {
    this.uploadListEl.innerHTML = "";

    this.sendButtonEl.style.display =
      this.fileInputEl.files.length === 0 ? "none" : "block";

    for (const file of this.fileInputEl.files) {
      const li = document.createElement("li");
      li.innerText = file.name;
      this.uploadListEl.appendChild(li);
    }
  }

  private async send() {
    const zip = downloadZip(this.fileInputEl.files);

    const date = new Date().toISOString().split("T")[0];
    const path = `/${date}/${id()}.zip`;

    const url = location.origin + path;

    await firebase.upload(path, await zip.blob());
    this.promptCopyUrl(url);
  }

  private promptCopyUrl(url: string) {
    const el = document.createElement("div");
    el.innerText = `Upload complete\n\nCopied to your clipboard:\n${url}`;
    el.className = "prompt";
    document.body.appendChild(el);
    navigator.clipboard.writeText(url);
  }
}
