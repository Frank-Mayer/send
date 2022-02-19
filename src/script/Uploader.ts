import { downloadZip } from "client-zip";
import { firebase } from "./firebase";
import { id } from "./idGen";
import md5 from "md5";
import type { HTMLListElement } from "./HTMLListElement";
import { displayByteSize } from "./displayByteSize";

export class Uploader {
  private readonly fileInputEl: HTMLInputElement;
  private readonly uploadListEl: HTMLListElement;
  private readonly uploadIndicatorEl: HTMLElement;
  private readonly sendButtonEl: HTMLElement;
  private readonly files = new Array<File>();

  constructor() {
    this.uploadListEl = document.createElement("ul");
    this.uploadListEl.id = "upload-list";
    document.body.appendChild(this.uploadListEl);

    this.uploadIndicatorEl = document.createElement("div");
    this.uploadIndicatorEl.id = "upload-indicator";
    document.body.appendChild(this.uploadIndicatorEl);

    this.sendButtonEl = document.createElement("div");
    this.sendButtonEl.id = "send";
    this.sendButtonEl.className = "floating-button";
    this.sendButtonEl.title = "Send";
    this.sendButtonEl.style.display = "none";
    document.body.appendChild(this.sendButtonEl);
    this.sendButtonEl.addEventListener("click", () => {
      this.send();
    });

    this.fileInputEl = document.createElement("input");
    this.fileInputEl.title = "";
    this.fileInputEl.type = "file";
    this.fileInputEl.multiple = true;

    this.fileInputEl.addEventListener("change", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      for (const file of this.fileInputEl.files) {
        this.files.push(file);
      }

      this.onUpload();
    });

    document.body.appendChild(this.fileInputEl);
  }

  private onUpload() {
    this.uploadListEl.innerHTML = "";

    this.sendButtonEl.style.display =
      this.files.length === 0 ? "none" : "block";

    for (const file of this.files) {
      const li = document.createElement("li");

      const name = document.createElement("span");
      name.innerText = file.name;
      name.className = "name";
      li.appendChild(name);

      const size = document.createElement("span");
      size.innerText = displayByteSize(file.size);
      size.className = "size";
      li.appendChild(size);

      this.uploadListEl.appendChild(li);
    }
  }

  private async send() {
    const zip = downloadZip(this.files);

    const date = new Date().toISOString().split("T")[0];
    const path = `/${date}/${id()}.zip`;

    const url = location.origin + path;

    const data = new Uint8Array(await zip.arrayBuffer());

    const md5Hash = md5(data);

    const uploadTask = firebase.upload(path, data, {
      contentType: "application/zip",
      md5Hash,
      customMetadata: {
        files: JSON.stringify(
          this.files.map((file) => ({ name: file.name, size: file.size }))
        ),
      },
    });

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.debug(progress);
      this.uploadIndicatorEl.style.backgroundPositionY = `${progress}%`;
      console.log(progress);
    });

    await uploadTask;

    this.promptCopyUrl(url);
  }

  private promptCopyUrl(url: string) {
    const el = document.createElement("div");
    el.innerText = `Upload complete\n\nDownload from here:\n${url}`;
    el.className = "prompt";
    document.body.appendChild(el);
    navigator.clipboard.writeText(url);
  }
}
