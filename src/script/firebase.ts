import { initializeApp } from "firebase/app";
import type { FirebaseOptions, FirebaseApp } from "firebase/app";
import {
  getStorage,
  ref as storage_ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage";

class Firebase {
  private readonly app: FirebaseApp;
  private readonly storage: FirebaseStorage;

  public constructor(options: FirebaseOptions) {
    this.app = initializeApp(options);
    this.storage = getStorage(this.app);
  }

  public upload(url: string, data: Blob | Uint8Array | ArrayBuffer) {
    const ref = storage_ref(this.storage, url);
    return uploadBytes(ref, data);
  }

  public downloadUrl(url: string) {
    const ref = storage_ref(this.storage, url);
    return getDownloadURL(ref);
  }

  public delete(url: string) {
    const ref = storage_ref(this.storage, url);
    return deleteObject(ref);
  }
}

export const firebase = new Firebase({
  apiKey: "AIzaSyDJaenCMPc1I3jlxctm8UZ0CEtiH84DJPg",
  authDomain: "send-36597.firebaseapp.com",
  projectId: "send-36597",
  storageBucket: "send-36597.appspot.com",
  messagingSenderId: "353114855096",
  appId: "1:353114855096:web:7054a4d8f838aebb4ac64d",
});
