import { downloadZip } from "client-zip";
import { firebase } from "./firebase";
import { id } from "./idGen";
import md5 from "md5";
import type { HTMLListElement } from "./HTMLListElement";
import { displayByteSize } from "./displayByteSize";
import { copyTextToClipboard } from "./cliploard";
import { decrypt, encrypt, exportKey } from "./crypt";

export class Uploader {
  private readonly fileInputEl: HTMLInputElement;
  private readonly uploadListEl: HTMLListElement;
  private readonly uploadIndicatorEl: HTMLElement;
  private readonly sendButtonEl: HTMLElement;
  private readonly files = new Array<File>();
  private get fileSizeSum() {
    return this.files.reduce((sum, file) => sum + file.size, 0);
  }

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
        if (file.size > 10490000 /* 10MiB*/) {
          alert(`${file.name} is too large (max 10MiB)`);
          continue;
        }

        if (this.fileSizeSum > 52450000 /* 50MiB*/) {
          alert("File size sum is too large (max 50MiB)");
          break;
        }

        this.files.push(file);
      }

      this.onUpload();
    });

    document.body.appendChild(this.fileInputEl);
  }

  private dispose() {
    this.uploadListEl.remove();
    this.sendButtonEl.remove();
    this.fileInputEl.remove();
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

    const url = location.origin + path + "#" + (await exportKey());

    const data = new Uint8Array(await encrypt(await zip.arrayBuffer()));

    const md5Hash = md5(data);

    this.dispose();

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
      this.uploadIndicatorEl.style.backgroundPositionY = `${progress}%`;
    });

    await uploadTask;

    this.promptCopyUrl(url);
  }

  private promptCopyUrl(url: string) {
    const el = document.createElement("div");
    el.className = "prompt";

    const textEl = document.createElement("span");
    textEl.innerText = "Upload complete\nDownload from here:";
    textEl.className = "text";
    el.appendChild(textEl);

    const urlEl = document.createElement("a");
    urlEl.href = url;
    urlEl.innerText = url;
    el.appendChild(urlEl);
    urlEl.className = "url";

    const copyEl = document.createElement("span");
    copyEl.innerText = "Click to copy this URL to clipboard";
    copyEl.addEventListener("click", () => {
      copyTextToClipboard(url).then((copied) => {
        copyEl.innerText = copied ? "Copied!" : "Failed to copy";
      });
    });
    copyEl.className = "copy";
    el.appendChild(copyEl);

    document.body.appendChild(el);
  }
}
